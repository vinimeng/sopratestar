import './style.css';
import { Game } from './game/Game';

// Inicializa o jogo quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () =>
{
    const canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.getElementById('app')?.appendChild(canvas);

    Game.init(canvas);
});
