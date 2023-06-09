/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import GameServer from "../../Game";
import AbstractShape from "./AbstractShape";

import { Color } from "../../Const/Enums";

/**
 * Pentagon entity class.
 */
export default class ColossalHexagon extends AbstractShape {
    /** If the pentagon is an alpha pentagon or not */
    public isColossal: boolean;

    protected static BASE_ROTATION = AbstractShape.BASE_ROTATION / 2;
    protected static BASE_ORBIT = AbstractShape.BASE_ORBIT / 2;
    protected static BASE_VELOCITY = AbstractShape.BASE_VELOCITY / 2;

    public constructor(game: GameServer, isColossal=true, shiny=(Math.random() < 0.35) && !isColossal) {
        super(game);
        
        this.nameData.values.name = isColossal ? "Colossal Hexagon" : "Colossal Hexagon";

        this.healthData.values.health = this.healthData.values.maxHealth = (isColossal ? 16000 : 16000);
        this.physicsData.values.size = (isColossal ? 800 : 800) * Math.SQRT1_2;
        this.physicsData.values.sides = 6;
        this.styleData.values.color = shiny ? Color.Shiny : Color.EnemyHexagon;

        this.physicsData.values.absorbtionFactor = isColossal ? 0.005 : 0.005;
        this.physicsData.values.pushFactor = 11;

        this.isColossal = isColossal;
        this.isShiny = shiny;

        this.damagePerTick = isColossal ? 60 : 60;
        this.scoreReward = isColossal ? 1024000 / 20: 1024000 / 20;
        
        if (shiny) {
            this.scoreReward *= 9;
            this.healthData.values.health = this.healthData.values.maxHealth *= 2;
        }
    }
}