import Client from "../Client"
import { AccessLevel, maxPlayerLevel } from "../config";
import AbstractBoss from "../Entity/Boss/AbstractBoss";
import Defender from "../Entity/Boss/Defender";
import SmallDefender from "../Entity/Boss/SmallDefender"
import FallenBooster from "../Entity/Boss/FallenBooster";
import FallenOverlord from "../Entity/Boss/FallenOverlord";
import Guardian from "../Entity/Boss/Guardian";
import FatGuardian from "../Entity/Boss/FatGuardian";
import FallenTrapper from "../Entity/Misc/Boss/FallenTrapper";
import Summoner from "../Entity/Boss/Summoner";
import LivingEntity from "../Entity/Live"
import Mothership from "../Entity/Misc/Mothership"
import ArenaCloser from "../Entity/Misc/ArenaCloser";
import FallenAC from "../Entity/Misc/Boss/FallenAC";
import FallenSpike from "../Entity/Misc/Boss/FallenSpike";
import Dominator from "../Entity/Misc/Dominator";
import ObjectEntity from "../Entity/Object";
import AbstractShape from "../Entity/Shape/AbstractShape";
import Crasher from "../Entity/Shape/Crasher";
import Pentagon from "../Entity/Shape/Pentagon";
import Heptagon from "../Entity/Shape/Heptagon"
import WepSquare from "../Entity/Shape/WepSquare"
import WepTriangle from "../Entity/Shape/WepTriangle"
import Octagon from "../Entity/Shape/Octagon"
import MazeWall from "../Entity/Misc/MazeWall";
import Dodecagon from "../Entity/Shape/Dodecagon"
import Hexagon from "../Entity/Shape/Hexagon"
import ColossalHexagon from "../Entity/Shape/ColossalHexagon"
import Square from "../Entity/Shape/Square";
import Circle from "../Entity/Shape/Circle";
import AdminCircle from "../Entity/Shape/AdminCircle";
import AdminSquare from "../Entity/Shape/AdminSquare";
import Triangle from "../Entity/Shape/Triangle";
import AutoTurret from "../Entity/Tank/AutoTurret";
import Bullet from "../Entity/Tank/Projectile/Bullet";
import TankBody from "../Entity/Tank/TankBody";
import { Entity, EntityStateFlags } from "../Native/Entity";
import { saveToVLog } from "../util";
import { Stat, StatCount, StyleFlags, Tank, ClientBound } from "./Enums";
import { getTankByName } from "./TankDefinitions"

const RELATIVE_POS_REGEX = new RegExp(/~(-?\d+)?/);

export const enum CommandID {
    gameSetTank = "tank",
    gameSetLevel = "level",
    gameSetScore = "score",
    gameSetStat = "stat",
    gameSetStatMax = "stat_max",
    gameAddUpgradePoints = "upgpoint",
    gameTeleport = "tp",
    gameClaim = "claim",
    gameGodmode = "god",
    adminSummon = "spawn",
    adminKillAll = "killall",
    adminKillEntity = "kill",
    adminCloseArena = "close",
    testCommand = "test",
    broadcastMessage = "broadcast"
}

export interface CommandDefinition {
    id: CommandID,
    usage?: string,
    description?: string,
    permissionLevel: AccessLevel,
    isCheat: boolean
}

export interface CommandCallback {
    (client: Client, ...args: string[]): string | void 
}

export const commandDefinitions = {
    tank: {
        id: CommandID.gameSetTank,
        usage: "[tank]",
        description: "Changes your tank to the given class",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    level: {
        id: CommandID.gameSetLevel,
        usage: "[level]",
        description: "Changes your level to the given whole number",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    score: {
        id: CommandID.gameSetScore,
        usage: "[score]",
        description: "Changes your score to the given whole number",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    stat: {
        id: CommandID.gameSetStat,
        usage: "[stat num] [points]",
        description: "Set the value of one of your statuses. Values can be greater than the capacity. [stat num] is equivalent to the number that appears in the UI",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    stat_max: {
        id: CommandID.gameSetStatMax,
        usage: "[stat num] [max]",
        description: "Set the max value of one of your statuses. [stat num] is equivalent to the number that appears in the UI",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    upgpoint: {
        id: CommandID.gameAddUpgradePoints,
        usage: "[points]",
        description: "Add upgrade points",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    tp: {
        id: CommandID.gameTeleport,
        usage: "[x] [y]",
        description: "Teleports you to the given position",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    claim: {
        id: CommandID.gameClaim,
        usage: "[entityName]",
        description: "Attempts claiming an entity of the given type",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    god: {
        id: CommandID.gameGodmode,
        usage: "[?value]",
        description: "Set the godemode. Toggles if [value] is not specified",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    spawn: {
        id: CommandID.adminSummon,
        usage: "[entityName] [?count] [?x] [?y]",
        description: "spawns entities at a certain location",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    killall: {
        id: CommandID.adminKillAll,
        description: "Kills all entities in the arena",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    kill: {
        id: CommandID.adminKillEntity,
        usage: "[entityName]",
        description: "Kills all entities of the given type (might include self)",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    close: {
        id: CommandID.adminCloseArena,
        description: "Closes the current arena",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    test: {
            id: CommandID.testCommand,
           description: "test command /shrug",
           permissionLevel: AccessLevel.FullAccess,
           isCheat: false
       },
    broadcast: {
            id: CommandID.broadcastMessage,
            usage: "[message]",
           description: "Broadcasts message to all clients",
           permissionLevel: AccessLevel.FullAccess,
           isCheat: false
       }
} as Record<CommandID, CommandDefinition>

export const commandCallbacks = {
    tank: (client: Client, tankNameArg: string) => {
        const tankDef = getTankByName(tankNameArg);
        const player = client.camera?.cameraData.player;
        if (!tankDef || !Entity.exists(player) || !(player instanceof TankBody)) return;
        if (tankDef.flags.devOnly && client.accessLevel !== AccessLevel.FullAccess) return;
        player.setTank(tankDef.id);
    },
    level: (client: Client, levelArg: string) => {
        const level = parseInt(levelArg);
        const player = client.camera?.cameraData.player;
        if (isNaN(level) || !Entity.exists(player) || !(player instanceof TankBody)) return;
        const finalLevel = client.accessLevel == AccessLevel.FullAccess ? level : Math.min(maxPlayerLevel, level);
        client.camera?.setLevel(finalLevel);
    },
    score: (client: Client, scoreArg: string) => {
        const score = parseInt(scoreArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (isNaN(score) || score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        camera.score = score;
    },
    stat_max: (client: Client, statIdArg: string, statMaxArg: string) => {
        const statId = StatCount - parseInt(statIdArg);
        const statMax = parseInt(statMaxArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (statId < 0 || statId >= StatCount || isNaN(statId) || isNaN(statMax) || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        const clampedStatMax = Math.max(statMax, 0);
        camera.statLimits[statId as Stat] = clampedStatMax;
        camera.statLevels[statId as Stat] = Math.min(camera.statLevels[statId as Stat], clampedStatMax);
    },
    stat: (client: Client, statIdArg: string, statPointsArg: string) => {
        const statId = StatCount - parseInt(statIdArg);
        const statPoints = parseInt(statPointsArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (statId < 0 || statId >= StatCount || isNaN(statId) || isNaN(statPoints) || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        camera.statLevels[statId as Stat] = statPoints;
    },
    upgpoint: (client: Client, pointsArg: string) => {
        const points = parseInt(pointsArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (isNaN(points) || points > Number.MAX_SAFE_INTEGER || points < Number.MIN_SAFE_INTEGER || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        camera.statsAvailable += points;
    },
    tp: (client: Client, xArg: string, yArg: string) => {
        const player = client.camera?.cameraData.player;
        if (!Entity.exists(player) || !(player instanceof ObjectEntity)) return;
        const x = xArg.match(RELATIVE_POS_REGEX) ? player.positionData.x + parseInt(xArg.slice(1) || "0", 10) : parseInt(xArg, 10);
        const y = yArg.match(RELATIVE_POS_REGEX) ? player.positionData.y + parseInt(yArg.slice(1) || "0", 10) : parseInt(yArg, 10);
        if (isNaN(x) || isNaN(y)) return;
        player.positionData.x = x;
        player.positionData.y = y;
        player.setVelocity(0, 0);
        player.entityState |= EntityStateFlags.needsCreate | EntityStateFlags.needsDelete;
    },
      test: (client: Client, xArg: string, yArg: string) => {
            return `fuckkk im cumming`;
    },
    broadcast: (client: Client, messageArg: string) => {
             const player = client.camera?.cameraData.player;
        if (!Entity.exists(player) || !(player instanceof TankBody)) return;
        if (client.accessLevel !== AccessLevel.FullAccess) return;
        player.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT(messageArg)
            .u32(0x000000)
            .float(10000)
            .stringNT("").send();
    },
    claim: (client: Client, entityArg: string) => {
        const TEntity = new Map([
          ["ArenaCloser", ArenaCloser],
          ["Dominator", Dominator],
          ["Shape", AbstractShape],
          ["Boss", AbstractBoss],
          ["AutoTurret", AutoTurret],
          ["SmallDefender", SmallDefender],
          ["FallenTrapper", FallenTrapper],
          ["FallenBooster", FallenBooster],
          ["FallenOverlord", FallenOverlord],
          ["Defender", Defender],
          ["Summoner", Summoner],
          ["FatGuardian", FatGuardian],
          ["FallenAC", FallenAC],
          ["ArenaCloser", ArenaCloser],
          ["Guardian", Guardian],
          ["FallenSpike", FallenSpike],
          ["Mothership", Mothership],
          ["Dominator", Dominator],
          ["FallenTrapper", FallenTrapper]
        ] as [string, typeof ObjectEntity][]).get(entityArg)

        if (!TEntity || !client.camera?.game.entities.AIs.length) return;

        const AIs = Array.from(client.camera.game.entities.AIs);
        for (let i = 0; i < AIs.length; ++i) {
            if (!(AIs[i].owner instanceof TEntity)) continue;
            client.possess(AIs[i]);
            return;
        }
    },
    god: (client: Client, activeArg?: string) => {
        const player = client.camera?.cameraData.player;
        if (!Entity.exists(player) || !(player instanceof TankBody)) return;

        switch (activeArg) {
            case "on":
                player.setInvulnerability(true);
                break;
            case "off":
                player.setInvulnerability(false);
                break;
            default:
                player.setInvulnerability(!player.isInvulnerable);
                break;
        }

        const godmodeState = player.isInvulnerable ? "ON" : "OFF";
        return `God mode: ${godmodeState}`;
    },
    spawn: (client: Client, entityArg: string, countArg?: string, xArg?: string, yArg?: string) => {
        const count = countArg ? parseInt(countArg) : 1;
        let x = parseInt(xArg || "0", 10);
        let y = parseInt(yArg || "0", 10);

        const player = client.camera?.cameraData.player;
        if (Entity.exists(player) && player instanceof ObjectEntity) {
            if (xArg && xArg.match(RELATIVE_POS_REGEX)) {
                x = player.positionData.x + parseInt(xArg.slice(1) || "0", 10);
            }
            if (yArg && yArg.match(RELATIVE_POS_REGEX)) {
                y = player.positionData.y + parseInt(yArg.slice(1) || "0", 10);
            }
        }

        const game = client.camera?.game;
        const TEntity = new Map([
            ["Defender", Defender],
            ["Summoner", Summoner],
            ["Guardian", Guardian],
            ["FallenOverlord", FallenOverlord],
            ["FallenBooster", FallenBooster],
            ["FallenAC", FallenAC],
            ["FallenSpike", FallenSpike],
            ["ArenaCloser", ArenaCloser],
            ["Crasher", Crasher],
            ["Pentagon", Pentagon],
            ["Octagon", Octagon],
            ["Hexagon", Hexagon],
            ["WepSquare", WepSquare],
            ["Heptagon", Heptagon],
            ["WepTriangle", WepTriangle],
            ["ColossalHexagon", ColossalHexagon],
            ["Square", Square],
            ["Triangle", Triangle],
            ["FatGuardian", FatGuardian],
            ["AdminSquare", AdminSquare],
            ["Dodecagon", Dodecagon],
            ["Circle", Circle],
            ["FallenTrapper", FallenTrapper],
            ["SmallDefender", SmallDefender],
            ["AdminCircle", AdminCircle],
            ["MazeWall", MazeWall]
        ] as [string, typeof ObjectEntity][]).get(entityArg);

        if (isNaN(count) || count < 0 || !game || !TEntity) return;

        for (let i = 0; i < count; ++i) {
            const boss = new TEntity(game);
            if (!isNaN(x) && !isNaN(y)) {
                boss.positionData.x = x;
                boss.positionData.y = y;
            }
        }
    },
    killall: (client: Client) => {
        const game = client.camera?.game;
        if(!game) return;
        for (let id = 0; id <= game.entities.lastId; ++id) {
			const entity = game.entities.inner[id];
			if (Entity.exists(entity) && entity instanceof LivingEntity && entity !== client.camera?.cameraData.player) entity.healthData.health = 0;
		}
    },
    close: (client: Client) => {
        client?.camera?.game.arena.close();
    },
    kill: (client: Client, entityArg: string) => {
        const TEntity = new Map([
          ["ArenaCloser", ArenaCloser],
          ["Dominator", Dominator],
          ["Bullet", Bullet],
          ["Tank", TankBody],
          ["Shape", AbstractShape],
          ["Boss", AbstractBoss]
        ] as [string, typeof LivingEntity][]).get(entityArg);
        const game = client.camera?.game;
        if (!TEntity || !game) return;

        for (let id = 0; id <= game.entities.lastId; ++id) {
			const entity = game.entities.inner[id];
			if (Entity.exists(entity) && entity instanceof TEntity) entity.healthData.health = 0;
		}
    }
} as Record<CommandID, CommandCallback>

export const executeCommand = (client: Client, cmd: string, args: string[]) => {
    if (!commandDefinitions.hasOwnProperty(cmd) || !commandCallbacks.hasOwnProperty(cmd)) {
        return (`${client.toString()} tried to run the invalid command ${cmd}`);
    }

    if (client.accessLevel < commandDefinitions[cmd as CommandID].permissionLevel) {
        return (`${client.toString()} tried to run the command ${cmd} with a permission that was too low`);
    }

    const commandDefinition = commandDefinitions[cmd as CommandID];
    if (commandDefinition.isCheat) client.setHasCheated(true);

    const response = commandCallbacks[cmd as CommandID](client, ...args);
    if (response) {
        client.notify(response, 0x00ff00, 5000, `cmd-callback${commandDefinition.id}`);
    }
}
