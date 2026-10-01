export const THEME_KEY = "theme";

/** Roda antes da pintura: aplica a escolha salva; sem escolha, o CSS segue o sistema. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;
