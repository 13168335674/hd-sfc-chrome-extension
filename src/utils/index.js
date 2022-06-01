export function runScript(code = "") {
  const sc = document.createElement("script");
  sc.type = "text/javascript";
  sc.innerHTML = code;
  document.body.appendChild(sc);
}

export function appendScript(src = "") {
  const sc = document.createElement("script");
  sc.type = "text/javascript";
  sc.src = src;
  document.body.appendChild(sc);
}
