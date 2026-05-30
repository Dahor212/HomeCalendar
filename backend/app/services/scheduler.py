import logging
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from .push_service import send_push_to_user, send_push_to_all

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")


def check_reminders():
    """Check for events and tasks that need reminder notifications."""
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # Check events
        events = db.query(models.Event).filter(
            models.Event.reminder_sent == False,
            models.Event.start > now,
        ).all()

        for event in events:
            start = event.start
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
            reminder_at = start - timedelta(minutes=event.reminder_minutes)
            if now >= reminder_at:
                body = f"Začíná za {event.reminder_minutes} minut: {event.title}"
                if event.shared:
                    send_push_to_all(db, "📅 Připomínka události", body, "/")
                else:
                    send_push_to_user(db, event.creator_id, "📅 Připomínka události", body, "/")
                event.reminder_sent = True
                logger.info("Reminder sent for event %s", event.id)

        db.commit()

        # Check tasks with due dates
        tasks = db.query(models.Task).filter(
            models.Task.reminder_sent == False,
            models.Task.completed == False,
            models.Task.due_date != None,
        ).all()

        for task in tasks:
            due = task.due_date
            if due.tzinfo is None:
                due = due.replace(tzinfo=timezone.utc)
            if due <= now:
                continue
            reminder_at = due - timedelta(minutes=task.reminder_minutes)
            if now >= reminder_at:
                body = f"Termín za {task.reminder_minutes} minut: {task.title}"
                if task.shared:
                    send_push_to_all(db, "✅ Připomínka úkolu", body, "/tasks")
                else:
                    user_id = task.assigned_to or task.creator_id
                    send_push_to_user(db, user_id, "✅ Připomínka úkolu", body, "/tasks")
                task.reminder_sent = True
                logger.info("Reminder sent for task %s", task.id)

        db.commit()

    except Exception as e:
        logger.error("Scheduler error: %s", e)
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(check_reminders, "interval", minutes=1, id="check_reminders")
    scheduler.start()
    logger.info("Scheduler started")


def stop_scheduler():
    scheduler.shutdown()
