import GameServer from "../../Game";
import AbstractShape from "./AbstractShape";

import { Color } from "../../Const/Enums";

export default class ShinySquare extends AbstractShape {
    public constructor(game: GameServer, shiny=Math.random() < 0.5) {
        super(game);
        this.nameData.values.name = "ShinySquare";
        this.healthData.values.health = this.healthData.values.maxHealth = 10;
        this.physicsData.values.size = 55 * Math.SQRT1_2;
        this.physicsData.values.sides = 7;
        this.styleData.values.color = shiny ? Color.Shiny : Color.EnemySquare;

        this.damagePerTick = 8;
        this.scoreReward = 10;
        this.isShiny = shiny;

        if (shiny) {
            this.scoreReward *= 100;
            this.healthData.values.health = this.healthData.values.maxHealth *= 10;
        }
    }
}
