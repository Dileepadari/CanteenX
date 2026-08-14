"""Pricing and customization rules.

Shared by the cart and the ordering service so a basket total and the order it
becomes are computed by exactly the same code. Prices are *never* taken from
the client - only option ids are, and their price deltas are looked up here.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass

from app.core.config import settings
from app.core.errors import ValidationError
from app.db.models import MenuItem


@dataclass(frozen=True, slots=True)
class PricedSelection:
    """A validated customization selection and what it costs."""

    normalised: dict[str, list[str]]
    price_delta_paise: int
    labels: list[str]

    @property
    def hash(self) -> str:
        return hash_customizations(self.normalised)


def hash_customizations(selection: dict[str, list[str]]) -> str:
    """Stable fingerprint used by the cart's uniqueness constraint.

    Sorting both keys and values is what makes `{"size":["l"],"add":["a","b"]}`
    and `{"add":["b","a"],"size":["l"]}` the same line. The old code compared
    raw dicts in Python, so option order alone created duplicate cart rows.
    """
    canonical = {key: sorted(values) for key, values in sorted(selection.items())}
    payload = json.dumps(canonical, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def price_customizations(item: MenuItem, raw_selection: dict | None) -> PricedSelection:
    """Validate a selection against the item's option groups and price it.

    Raises if a required group is missing, an unknown option id is supplied, or
    a single-select group receives more than one value - all of which the old
    build accepted silently, storing whatever JSON the client sent.
    """
    selection = raw_selection or {}
    if not isinstance(selection, dict):
        raise ValidationError("Customizations must be an object.")

    groups = {str(g.get("id")): g for g in (item.customization_groups or [])}

    unknown = set(map(str, selection.keys())) - set(groups)
    if unknown:
        raise ValidationError(
            f"Unknown customization group(s): {', '.join(sorted(unknown))}."
        )

    normalised: dict[str, list[str]] = {}
    total_delta = 0
    labels: list[str] = []

    for group_id, group in groups.items():
        options = {str(o.get("id")): o for o in group.get("options", [])}
        chosen_raw = selection.get(group_id, [])

        if isinstance(chosen_raw, str):
            chosen_raw = [chosen_raw]
        if not isinstance(chosen_raw, list):
            raise ValidationError(
                f"Selection for '{group.get('label', group_id)}' must be a list."
            )

        chosen = [str(value) for value in chosen_raw]

        unknown_options = set(chosen) - set(options)
        if unknown_options:
            raise ValidationError(
                f"Unknown option(s) for '{group.get('label', group_id)}': "
                f"{', '.join(sorted(unknown_options))}."
            )

        if group.get("required") and not chosen:
            raise ValidationError(f"Please choose a {group.get('label', group_id)}.")

        if group.get("selection", "single") == "single" and len(chosen) > 1:
            raise ValidationError(
                f"Only one {group.get('label', group_id)} can be selected."
            )

        if chosen:
            normalised[group_id] = sorted(set(chosen))
            for option_id in normalised[group_id]:
                option = options[option_id]
                total_delta += int(option.get("priceDeltaPaise", 0) or 0)
                labels.append(str(option.get("label", option_id)))

    return PricedSelection(
        normalised=normalised, price_delta_paise=total_delta, labels=labels
    )


def unit_price_paise(item: MenuItem, selection: PricedSelection) -> int:
    price = int(item.price_paise) + selection.price_delta_paise
    if price < 0:
        # A misconfigured negative option delta must never produce a credit.
        raise ValidationError("That combination of options is not valid.")
    return price


def calculate_tax_paise(subtotal_paise: int) -> int:
    """Tax in paise, rounded half-up at the basket level.

    Integer arithmetic throughout: the previous Float-based totals could not
    represent 0.1 exactly, so tax drifted by a paisa on some baskets.
    """
    return (subtotal_paise * settings.tax_rate_bps + 5_000) // 10_000


def calculate_total_paise(
    subtotal_paise: int, tax_paise: int, discount_paise: int = 0
) -> int:
    total = subtotal_paise + tax_paise - discount_paise
    return max(total, 0)
