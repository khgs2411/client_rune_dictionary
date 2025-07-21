import { Guards, NamespaceActions, Rxjs, WebsocketStructuredMessage } from "topsyde-utils";
import useAuth from "../../common/composables/useAuth";
import usePrompt, { PromptChoice, PromptData } from "../../common/composables/usePrompt";
import useUtils from "../../common/composables/useUtils";
import { I_WebsocketEventHandler } from "../../common/composables/useWebsocketEventHandler";
import { WebsocketClient } from "../../common/composables/useWebsocketInterface";
import { I_UseWSM } from "../../common/composables/useWSM";
import { MatchResult, useMatchStore } from "../../stores/match.store";
import { E_MatchState, MATCH_MESSAGE } from "./useMatch";



const useMatchWebsocketEventHandler = (): I_WebsocketEventHandler => {
    const prompt$ = usePrompt();
    const auth$ = useAuth();
    const store = useMatchStore();
    const utils = useUtils();


    function onWebsocketEvents(wsm$: I_UseWSM) {
        if (wsm$.is("match")) onMatchRequest(wsm$);
        else onGameEvent(wsm$);
    }

    function outputEvents(ws: WebsocketClient): NamespaceActions {
        return {
            'match.action': (data) => {
                console.log("Attack action received:", data);
                if (Guards.IsNil(store.currentChannelId)) {
                    throw new Error("Cannot send action: No current channel ID");
                }

                if (Guards.IsNil(auth$.client.value)) {
                    throw new Error("Cannot send action: No authenticated client");
                }

                const wsm: WebsocketStructuredMessage = {
                    type: 'match.action',
                    content: { action: 'attack', ...data },
                    channel: store.currentChannelId,
                    timestamp: new Date().toISOString(),
                    client: auth$.client.value,
                    metadata: {},
                }
                ws.send(JSON.stringify(wsm));
            }
        }
    }


    /**
     * Handle a match request
     * @param wsm$ - The websocket structured message
     */
    function onMatchRequest(wsm$: I_UseWSM) {
        prompt$.next({
            message: MATCH_MESSAGE,
            from: wsm$.client.value,
            time: 10,
            metadata: wsm$.data,
            callback: (choice: PromptChoice, data: PromptData<WebsocketStructuredMessage>) => {
                if (!data.metadata) return;
                console.log(choice, data.metadata);
            },
        });
    }


    function onGameEvent(wsm$: I_UseWSM) {
        console.log("Received game event:", wsm$.data);

        // Handle different game event types
        switch (wsm$.data?.type) {
            // New server events for server-authoritative combat
            case "match.damage.dealt":
                handleDamageDealt(wsm$.data);
                break;
            case "match.health.update":
                handleHealthUpdate(wsm$.data);
                break;
            case "match.turn.start":
                handleTurnStart(wsm$.data);
                break;
            case "match.turn.end":
                handleTurnEnd(wsm$.data);
                break;
            case "match.victory":
                handleVictory(wsm$.data);
                break;
            case "match.error":
                handleMatchError(wsm$.data);
                break;
            default:
                console.log("Unknown game event type:", wsm$.data?.type);
        }
    }




    /**
     * Handle damage dealt events from server
     */
    function handleDamageDealt(data: any) {
        console.log("Damage dealt:", data);

        const { attackerId, targetId, damage, message } = data.content || data;
        const currentUserId = auth$.client.value?.id;

        // Update UI with damage information (could trigger animations, floating text, etc.)
        utils.toast.info(message, "bottom-right");

        // Update actions performed counter
        store.gameState.actionsPerformed++;

        // Add to game log if callback is available
        const logType = attackerId === currentUserId ? "player" : "enemy";
        Rxjs.Next('match', { 'cta': 'onLogEntry', data: { type: logType, message } });

        console.log(`${attackerId} dealt ${damage} damage to ${targetId}`);
    }

    /**
     * Handle health update events from server
     */
    function handleHealthUpdate(data: any) {
        console.log("Health update:", data);

        const { entityId, health, maxHealth } = data.content || data;
        const currentUserId = auth$.client.value?.id;

        // Update health in game state based on entity
        if (entityId === currentUserId) {
            // Update player health
            store.gameState.playerHealth = health;
            store.gameState.playerMaxHealth = maxHealth;
            Rxjs.Next('match', { cta: 'onLogEntry', data: { type: 'player', message: 'Health updated' } })
        } else {
            // Update enemy health
            store.gameState.enemyHealth = health;
            store.gameState.enemyMaxHealth = maxHealth;
            Rxjs.Next('match', { cta: 'onLogEntry', data: { type: 'enemy', message: 'Health updated' } })
        }

        console.log(`Health updated for ${entityId}: ${health}/${maxHealth}`);
    }

    /**
     * Handle turn start events from server
     */
    function handleTurnStart(data: any) {
        console.log("Turn start:", data);

        const { entityId, turnNumber } = data.content || data;
        const currentUserId = auth$.client.value?.id;

        // Update turn state
        if (entityId === currentUserId) {
            store.gameState.currentTurn = 'player';
            utils.toast.info("Your turn!", "bottom-right");
            // Call frontend callback to update UI
            Rxjs.Next('match', { cta: 'onPlayerTurn', data: {} },);
        } else {
            store.gameState.currentTurn = 'enemy';
            utils.toast.info("Enemy's turn...", "bottom-right");
            // Call frontend callback to update UI
            Rxjs.Next('match', { cta: 'onEnemyTurn', data: {} },);
        }

        console.log(`Turn ${turnNumber} started for ${entityId}(${currentUserId})`);
    }

    /**
     * Handle turn end events from server
     */
    function handleTurnEnd(data: any) {
        console.log("Turn end:", data);

        const { entityId, turnNumber } = data.content || data;
        // Could add turn end animations or effects here

        console.log(`Turn ${turnNumber} ended for ${entityId}`);
    }

    /**
     * Handle victory events from server
     */
    function handleVictory(data: any) {
        console.log("Victory event:", data);

        const { result, winnerId, message } = data.content || data;
        const currentUserId = auth$.client.value?.id;

        // Determine result from player's perspective
        let playerResult: 'victory' | 'defeat' | 'draw';
        if (winnerId === currentUserId) {
            playerResult = 'victory';
        } else {
            playerResult = 'defeat';
        }

        // Handle match end with server-determined result
        handleMatchEnd({
            type: 'match.end',
            result: playerResult,
            message
        });

        console.log(`Victory: ${result}, Winner: ${winnerId}`);
    }

    /**
     * Handle match error events from server
     */
    function handleMatchError(data: any) {
        console.log("Match error:", data);

        const { error, entityId } = data.content || data;
        const currentUserId = auth$.client.value?.id;

        // Show error message to user if it affects them
        if (!entityId || entityId === currentUserId) {
            utils.toast.error(typeof error === 'string' ? error : 'Match error occurred', "center");
        }

        console.error(`Match error for ${entityId || 'unknown'}: ${error}`);
    }


    /**
     * Handle match end events
     */
    function handleMatchEnd(data: any) {
        console.log("Match ended:", data);

        // Calculate match duration
        const startTime = store.gameState.matchStartTime;
        const duration = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;

        // Determine match result based on game state
        const result = determineMatchResult(data);

        // Create match result object
        const matchResult: MatchResult = {
            result,
            duration,
            playerHealth: store.gameState.playerHealth,
            enemyHealth: store.gameState.enemyHealth,
            actionsPerformed: store.gameState.actionsPerformed,
            timestamp: new Date()
        };

        // Store match result
        store.matchResult = matchResult;
        store.matchHistory.push(matchResult);

        // Set match state to finished
        store.matchState = E_MatchState.FINISHED;

        // Save match result to database (if available)
        saveMatchResult(matchResult);

        // Show match result notification
        const resultMessage = getMatchResultMessage(result);
        if (result === 'victory') {
            utils.toast.success(resultMessage, "bottom-right");
        } else if (result === 'defeat') {
            utils.toast.error(resultMessage, "bottom-right");
        } else {
            utils.toast.info(resultMessage, "bottom-right");
        }

        console.log("Match result:", matchResult);
    }


    /**
     * Determine match result - now server authoritative only
     */
    function determineMatchResult(data: any): 'victory' | 'defeat' | 'disconnect' | 'draw' {
        // Server always provides the result - no frontend logic needed
        if (data?.result) {
            return data.result;
        }

        // If no result provided by server, default to disconnect
        // This should not happen in normal server-authoritative flow
        console.warn('Match ended without server-provided result, defaulting to disconnect');
        return 'disconnect';
    }

    /**
     * Get user-friendly match result message
     */
    function getMatchResultMessage(result: string): string {
        switch (result) {
            case 'victory':
                return '🎉 Victory! You defeated the AI opponent!';
            case 'defeat':
                return '💀 Defeat! The AI opponent proved too strong.';
            case 'draw':
                return '🤝 Draw! Both fighters fell in battle.';
            case 'disconnect':
                return '🔌 Match ended due to disconnection.';
            default:
                return 'Match completed.';
        }
    }

    /**
     * Save match result to database (placeholder for MongoDB integration)
     */
    async function saveMatchResult(result: MatchResult) {
        try {
            // TODO: Integrate with MongoDB to save match statistics
            console.log("Saving match result to database:", result);

            // This will be implemented when backend MongoDB integration is ready
            // await api.saveMatchResult(auth$.client.value.id, result);
        } catch (error) {
            console.error("Failed to save match result:", error);
        }
    }


    return {
        outputEvents,
        onWebsocketEvents,
    }
};

export default useMatchWebsocketEventHandler;