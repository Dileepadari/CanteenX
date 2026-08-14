"""Schema assembly, error formatting, and query-cost limits."""

from __future__ import annotations

from typing import Any

import strawberry
from graphql.error import GraphQLError
from strawberry.extensions import MaxAliasesLimiter, MaxTokensLimiter, QueryDepthLimiter
from strawberry.schema.config import StrawberryConfig

from app.api.graphql.mutations import Mutation
from app.api.graphql.queries import Query
from app.api.graphql.subscriptions import Subscription
from app.core.config import settings
from app.core.errors import AppError
from app.core.logging import get_logger, get_request_id

logger = get_logger(__name__)


class CanteenXSchema(strawberry.Schema):
    """Schema that normalises errors before they reach the client.

    Strawberry formats errors from each `GraphQLError`'s own `message` and
    `extensions`, so rewriting them here is what actually changes the response.
    Domain errors keep their safe message and gain a machine-readable code the
    client branches on (`unauthenticated` triggers refresh-and-retry,
    `out_of_stock` re-renders the cart). Everything else is logged in full and
    reported generically, so internals never leak.
    """

    def process_errors(
        self,
        errors: list[GraphQLError],
        execution_context: Any = None,
    ) -> None:
        for error in errors:
            original = error.original_error

            if isinstance(original, AppError):
                error.message = original.message
                error.extensions = {
                    **(error.extensions or {}),
                    **original.as_extensions(),
                }
                continue

            if original is not None:
                logger.error(
                    "Unhandled GraphQL error",
                    exc_info=original,
                    extra={"path": error.path, "request_id": get_request_id()},
                )
                error.message = "Something went wrong. Please try again."
                error.extensions = {
                    "code": "internal_error",
                    "requestId": get_request_id(),
                }
                continue

            # Parse and validation errors have no original exception and are
            # safe to return verbatim - they describe the client's own query.
            error.extensions = {"code": "bad_request", **(error.extensions or {})}


extensions: list[Any] = [
    QueryDepthLimiter(max_depth=settings.graphql_max_depth),
    MaxAliasesLimiter(max_alias_count=settings.graphql_max_aliases),
    MaxTokensLimiter(max_token_count=2000),
]

if not settings.introspection_enabled:
    # Actually disabling introspection needs a validation rule. The previous
    # build only *claimed* to disable it in a comment and passed no config,
    # so the full schema was readable in production.
    from graphql.validation import NoSchemaIntrospectionCustomRule
    from strawberry.extensions import AddValidationRules

    extensions.append(AddValidationRules([NoSchemaIntrospectionCustomRule]))


schema = CanteenXSchema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
    config=StrawberryConfig(
        auto_camel_case=True,
        # Suppressing "did you mean …?" hints stops the error text itself from
        # leaking field names once introspection is off.
        disable_field_suggestions=settings.environment.is_production,
    ),
    extensions=extensions,
)
