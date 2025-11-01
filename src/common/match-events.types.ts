import { WebsocketStructuredMessage } from 'topsyde-utils';

/**
 * Event: match.state.change
 * Emitted when match transitions between states (READY → STARTING → IN_PROGRESS → ENDING → FINISHED)
 */
export type MatchStateChangeEvent = WebsocketStructuredMessage<{
  matchId: string;
  previousState: string;
  currentState: string;
  reason: string;
  timestamp: string;
}>;

/**
 * Event: match.created
 * Emitted when a match is successfully created
 */
export type MatchCreatedEvent = WebsocketStructuredMessage<{
  matchId: string;
  channelName: string;
}>;

/**
 * Event: match.atb.readiness.update
 * Emitted periodically (every 250ms) with ATB readiness for all entities
 */
export type MatchATBReadinessUpdateEvent = WebsocketStructuredMessage<{
  matchId: string;
  atbData: {
    [entityId: string]: {
      readiness: number;
    };
  };
  timestamp: string;
}>;

/**
 * Event: match.state.update
 * Emitted periodically with full game state (turn, timer, etc.)
 */
export type MatchStateUpdateEvent = WebsocketStructuredMessage<{
  matchId: string;
  gameState: {
    currentTurnEntityId: string;
    turnCounter: number;
    timer: {
      active: boolean;
      remaining: number;
      elapsed: number;
      percentage: number;
      duration: number;
      warningThreshold: number;
      fallbackAction: 'pass' | 'skip';
    };
  };
  timestamp: string;
}>;

/**
 * Event: match.turn.start
 * Emitted when a new turn begins for an entity
 */
export type MatchTurnStartEvent = WebsocketStructuredMessage<{
  matchId: string;
  entityId: string;
  turnNumber: number;
  timestamp: string;
}>;

/**
 * Event: match.turn.end
 * Emitted when a turn ends for an entity
 */
export type MatchTurnEndEvent = WebsocketStructuredMessage<{
  matchId: string;
  entityId: string;
  turnNumber: number;
  timestamp: string;
}>;

/**
 * Event: match.damage.dealt
 * Emitted when damage is dealt to an entity
 */
export type MatchDamageDealtEvent = WebsocketStructuredMessage<{
  matchId: string;
  attackerId: string;
  targetId: string;
  damage: number;
  message: string;
  timestamp: string;
}>;

/**
 * Event: match.health.update
 * Emitted when an entity's health changes
 */
export type MatchHealthUpdateEvent = WebsocketStructuredMessage<{
  matchId: string;
  entityId: string;
  health: number;
  maxHealth: number;
  timestamp: string;
}>;

/**
 * Event: match.victory
 * Emitted to each participant with their result (victory or defeat)
 */
export type MatchVictoryEvent = WebsocketStructuredMessage<{
  matchId: string;
  result: 'victory' | 'defeat';
  winnerId: string;
  entityId: string;
  message: string;
  timestamp: string;
}>;

/**
 * Event: match.end
 * Emitted when the match officially ends
 */
export type MatchEndEvent = WebsocketStructuredMessage<{
  matchId: string;
  winnerId: string;
  timestamp: string;
}>;

/**
 * Discriminated union of all match event types for type-safe routing
 */
export type MatchEvent =
  | MatchStateChangeEvent
  | MatchCreatedEvent
  | MatchATBReadinessUpdateEvent
  | MatchStateUpdateEvent
  | MatchTurnStartEvent
  | MatchTurnEndEvent
  | MatchDamageDealtEvent
  | MatchHealthUpdateEvent
  | MatchVictoryEvent
  | MatchEndEvent;
