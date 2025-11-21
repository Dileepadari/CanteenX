from datetime import datetime, timezone
from zoneinfo import ZoneInfo


def to_ist_iso(dt: datetime | None) -> str | None:
	"""Convert a datetime to Asia/Kolkata ISO8601 string.

	If dt is naive, assume UTC. Returns None when dt is None.
	"""
	if dt is None:
		return None
	if dt.tzinfo is None:
		dt = dt.replace(tzinfo=timezone.utc)
	return dt.astimezone(ZoneInfo("Asia/Kolkata")).isoformat()
