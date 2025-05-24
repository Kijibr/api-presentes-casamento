import { Request, Response } from 'express';
import { CreateEventDTO, UpdateEventDTO } from '../types/event';
import * as EventService from "../services/events/eventsService";

export async function createEvent(req: Request, res: Response) {
  try {
    const eventData: CreateEventDTO = req.body;
    const eventId = await EventService.createEvent(eventData);

    if (!eventId) {
      return res.status(400).json({ error: 'Error creating event' });
    }

    return res.status(201).json({ id: eventId });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllEvents(req: Request, res: Response) {
  try {
    const events = await EventService.getAllEvents();
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEventById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const event = await EventService.getEventById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const eventData: UpdateEventDTO = req.body;

    const updatedEventId = await EventService.updateEvent(id, eventData);

    if (!updatedEventId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ id: updatedEventId });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await EventService.deleteEvent(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
