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
import { ClientBound } from "../../Const/Enums";
import * as util from "../../util";

export default class AdminCircle extends AbstractShape {
    public constructor(game: GameServer, shiny=false, jungle=false) {
        super(game);
        
        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT(`A special shape has spawned somewhere in the map! Be the first one to kill it!`)
            .u32(0x000000)
            .float(10000)
            .stringNT("").send();

        this.nameData.values.name = "The Father of the Circles";
        this.healthData.values.health = this.healthData.values.maxHealth = 50000;
        this.physicsData.values.size = 500 * Math.SQRT1_2;
        this.physicsData.values.sides = 1;
        this.styleData.values.color = 0x000000;

        this.damagePerTick = this.healthData.values.health;
        this.physicsData.values.pushFactor = 1000;
        this.scoreReward = 1000000000;
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
    public tick() {
        const funny = Math.floor(Math.random() * 7) + 1;
        if (funny == 1) this.styleData.values.color = 0xFF0000;
        if (funny == 2) this.styleData.values.color = 0xF7FF00;
        if (funny == 3) this.styleData.values.color = 0x00FF00;
        if (funny == 4) this.styleData.values.color = 0x00FFF7;
        if (funny == 5) this.styleData.values.color = 0x0000FF;
        if (funny == 6) this.styleData.values.color = 0xFF00FF;
        if (funny == 7) this.styleData.values.color = 0xFFFFFF;
        }
}
