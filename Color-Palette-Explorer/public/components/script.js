document.addEventListener("DOMContentLoaded", function () {
  loadPalettes();
  let hue = document.getElementById("hue").value;
  let saturation = document.getElementById("saturation").value;
  let lightness = document.getElementById("lightness").value;
  document.getElementById("hue").addEventListener("input", updateColorInput);
  document.querySelector(".btn-share").addEventListener("click", function() {
    sharePalettes();
  });
  document.getElementById("saturation").addEventListener("input", updateColorInput);
  document.getElementById("lightness").addEventListener("input", updateColorInput);
  document.querySelector(".btn-add-color").addEventListener("click", function() {
    addColorInput(hue, saturation, lightness);
  });
  document.querySelector(".btn-reset").addEventListener("click", resetPalettes);

  document.querySelector(".btn-remove-colors").addEventListener("click", resetColorInput);


  addColorInput(hue, saturation, lightness);

  document.querySelector(".btn-save-palette").addEventListener("click", savePalette);
});
function hslToHex(hue, saturation, lightness) {
  saturation /= 100;
  lightness /= 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs(huePrime % 2 - 1));

  let rgb = [0, 0, 0]

  if (0 <= huePrime && huePrime < 1) {
    rgb = [chroma, x, 0];
  } else if (1 <= huePrime && huePrime < 2) {
    rgb = [x, chroma, 0];
  } else if (2 <= huePrime && huePrime < 3) {
    rgb = [0, chroma, x];
  } else if (3 <= huePrime && huePrime < 4) {
    rgb = [0, x, chroma];
  } else if (4 <= huePrime && huePrime < 5) {
    rgb = [x, 0, chroma];
  } else if (5 <= huePrime && huePrime < 6) {
    rgb = [chroma, 0, x];
  }

  const lightnessAdjustment = lightness - chroma / 2;

  for(let i = 0; i < 3; i++ ){
    rgb[i] += lightnessAdjustment;
  }

  for(let i = 0; i < 3; i++ ) {
    rgb[i] = Math.round(rgb[i] * 255).toString(16).padStart(2, "0");
  }

  return `#${rgb.join("")}`;
}

function addColorInput(hue, saturation, lightness) {
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = `#${hslToHex(hue, saturation, lightness)}`;
  document.querySelector(".color-picker-container").appendChild(colorInput);
  updateColorInput();
}

function updateColorInput() {
  const ids = ["hue", "saturation", "lightness"];
  const labels = ["hue-value", "saturation-value", "lightness-value"];
  const values = ids.map(id => document.getElementById(id).value);
  const percentValues = values.map(value => value + "%");

  labels.forEach((label, index) => {
    document.getElementById(label).textContent = percentValues[index];
  });

  const lastColorInput = document.querySelector(".color-picker-container input:last-of-type");
  if (lastColorInput) {
    const [hue, saturation, lightness] = values;
    lastColorInput.value = hslToHex(hue, saturation, lightness);
  }
}

function savePalette() {
  const paletteNameInput = document.getElementById("palette-name");
  let paletteName = paletteNameInput.value.trim();

  const savedPalettes = JSON.parse(localStorage.getItem("palettes")) || [];
  if (!paletteName) {
    const paletteCount = savedPalettes.filter(palette => palette.name.startsWith("Палитра")).length;
    paletteName = paletteCount === 0 ? "Палитра 1:  " : `Палитра ${paletteCount + 1}:   `;
  }

  const colors = Array.from(document.querySelectorAll(".color-picker-container input")).map((input) => input.value);
  if (colors.length === 0) {
    alert("Добавьте цвета в палитру.");
    return;
  }
  const palette = { name: paletteName, colors };
  displayPalette(palette);
  saveToLocalStorage(palette);
  resetColorInput();
}

function displayPalette(palette) {

  const nameContainer = document.createElement("div");
  nameContainer.classList.add("palette-name-container");

  const paletteName = document.createElement("div");
  paletteName.textContent = palette.name;
  paletteName.style.color = "black";

  const paletteDiv = document.createElement("div");
  paletteDiv.classList.add("palette");
  palette.colors.forEach((color) => {
    const colorBlock = document.createElement("div");
    colorBlock.classList.add("color-block");
    colorBlock.style.backgroundColor = color;
    paletteDiv.appendChild(colorBlock);
  });

  const displayArea = document.querySelector(".palette-display");
  nameContainer.appendChild(paletteName);
  displayArea.appendChild(nameContainer);
  displayArea.appendChild(paletteDiv);
}

function resetPalettes() {
  localStorage.clear();
  resetColorInput();
  document.querySelector(".palette-display").innerHTML = "";
}

function resetColorInput() {
  const container = document.querySelector(".color-picker-container");
  container.innerHTML = "";

  let hsl = ["hue", "saturation", "lightness", "hue-value", "saturation-value", "lightness-value"];

  for(let i = 0; i < 3; i++){
    document.getElementById(hsl[i]).value = 0;
    document.getElementById(hsl[i+3]).textContent = "0";
  }
  document.getElementById("saturation-value").textContent += '%';
  document.getElementById("lightness-value").textContent += '%';

  addColorInput();
}

function loadPalettes() {
  const palettes = JSON.parse(localStorage.getItem("palettes")) || [];
  palettes.forEach(displayPalette);
}

function saveToLocalStorage(palette) {
  const palettes = JSON.parse(localStorage.getItem("palettes")) || [];
  palettes.push(palette);
  localStorage.setItem("palettes", JSON.stringify(palettes));
}


function sharePalettes() {
  const palettes = JSON.parse(localStorage.getItem("palettes")) || [];
  const textRepresentation = palettes.map(palette => {
    const paletteColors = palette.colors.join(", ");
    return `${palette.name}: ${paletteColors}`;
  }).join("\n");
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = textRepresentation;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextarea);
  alert("Вы скопировали название и коды цветов в палетке! Теперь вы можете отправить это сообщение друзьям");
}
