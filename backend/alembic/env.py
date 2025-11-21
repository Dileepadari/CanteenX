import sys
import os
from logging.config import fileConfig

from alembic import context

# make sure the app package is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

from app.core.database import engine, Base  # noqa: E402

# Import all models so Alembic can detect them for autogenerate
from app.models import user, canteen, menu_item, cart, order, complaints, payment  # noqa: E402, F401

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we create an Engine and associate a connection with the
    context.
    """
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_as_batch=False,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    raise RuntimeError("Offline mode is not supported by this env.py setup")
else:
    run_migrations_online()
