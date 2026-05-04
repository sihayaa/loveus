async function updateTemps() {
  try {
    // Coordinates
    const vegasCoords = "36.1699,-115.1398";
    const manilaCoords = "14.5995,120.9842";

    const vegasRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=36.1699&longitude=-115.1398&current=temperature_2m,apparent_temperature&timezone=America/Los_Angeles`
    ).then(r => r.json());

    const manilaRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=14.5995&longitude=120.9842&current=temperature_2m,apparent_temperature&timezone=Asia/Manila`
    ).then(r => r.json());

    const v = vegasRes.current;
    const m = manilaRes.current;

    document.getElementById("vegas-temp").textContent =
      `🌡️ ${v.temperature_2m}°C (feels ${v.apparent_temperature}°C)`;

    document.getElementById("manila-temp").textContent =
      `🌡️ ${m.temperature_2m}°C (feels ${m.apparent_temperature}°C)`;

  } catch (err) {
    console.log("temperature failed", err);
  }
}

updateTemps();
setInterval(updateTemps, 1800000);
