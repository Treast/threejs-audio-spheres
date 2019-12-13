import App from './utils/App';
import Scene from './Scene';

const app = new App();

app.isReady().then(() => {
  Scene.init();
  Scene.render();
});
