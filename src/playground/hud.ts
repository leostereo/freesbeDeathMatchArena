import * as GUI from '@babylonjs/gui'

export class Hud {

    private advancedTexture: GUI.AdvancedDynamicTexture;
    player1HudMessage = new GUI.TextBlock();
    player2HudMessage = new GUI.TextBlock();

    constructor(advancedTexture:GUI.AdvancedDynamicTexture) {
        this.advancedTexture = advancedTexture;
        this.player1HudMessage.text = ''
        this.player1HudMessage.color = "red";
        this.player1HudMessage.fontSize = 24;
        this.player1HudMessage.top = "-300px";
        this.player1HudMessage.left = "600px";
        this.advancedTexture.addControl(this.player1HudMessage);
        
        this.player2HudMessage.text = ''
        this.player2HudMessage.color = "green";
        this.player2HudMessage.fontSize = 24;
        this.player2HudMessage.top = "-300px";
        this.player2HudMessage.left = "-600px";
        this.advancedTexture.addControl(this.player2HudMessage);
    }

    public updatePlayer1Hud(message:string) {
        this.player1HudMessage.text = message;
    }

    public updatePlayer2Hud(message:string) {
        this.player2HudMessage.text = message;
    }

}