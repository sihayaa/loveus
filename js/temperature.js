async function updateTemps() {
  try {
    const vegasRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=36.1699&longitude=-115.1398&current=temperature_2m,apparent_temperature&timezone=America/Los_Angeles`
    ).then(r => r.json());

    const manilaRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=14.5995&longitude=120.9842&current=temperature_2m,apparent_temperature&timezone=Asia/Manila`
    ).then(r => r.json());

    const v = vegasRes.current;
    const m = manilaRes.current;

    const toF = (c) => (c * 9/5) + 32;

    document.getElementById("vegas-temp").textContent =
      `🌡️ ${v.temperature_2m}°C / ${toF(v.temperature_2m).toFixed(1)}°F (feels ${v.apparent_temperature}°C / ${toF(v.apparent_temperature).toFixed(1)}°F)`;

    document.getElementById("manila-temp").textContent =
      `🌡️ ${m.temperature_2m}°C / ${toF(m.temperature_2m).toFixed(1)}°F (feels ${m.apparent_temperature}°C / ${toF(m.apparent_temperature).toFixed(1)}°F)`;

  } catch (err) {
    console.log("temperature failed", err);
  }
}

updateTemps();
setInterval(updateTemps, 1800000);
