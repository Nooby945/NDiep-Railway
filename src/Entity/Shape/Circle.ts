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

export default class Circle extends AbstractShape {
    public constructor(game: GameServer, shiny=false, jungle=false) {
        super(game);
        this.nameData.values.name = "Circle";
        this.healthData.values.health = this.healthData.values.maxHealth = 0.0011;
        this.physicsData.values.size = 27.5 * Math.SQRT1_2;
        this.physicsData.values.sides = 1;
        this.styleData.values.color = shiny ? Color.Shiny : Color.White;

        this.damagePerTick = this.healthData.values.health;
        this.scoreReward = 5;
        this.isShiny = shiny;

        if (shiny) {
            this.scoreReward *= 100;
            this.healthData.values.health = this.healthData.values.maxHealth *= 10;
        }
	if (jungle) {
		this.physicsData.values.size *= 2.6;
        	this.healthData.values.health = (this.healthData.values.maxHealth *= 4.3);
        	this.physicsData.values.absorbtionFactor /= 6;
        	this.scoreReward *= 50
	}
    }
}
