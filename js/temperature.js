async function updateTemps(){
  try{
    const vegas = await fetch("https://wttr.in/Las+Vegas?format=j1").then(r=>r.json());
    const manila = await fetch("https://wttr.in/Manila?format=j1").then(r=>r.json());

    document.getElementById("vegas-temp").textContent =
      `🌡️ ${vegas.current_condition[0].temp_C}°C/${vegas.current_condition[0].temp_F}°F`;

    document.getElementById("manila-temp").textContent =
      `🌡️ ${manila.current_condition[0].temp_C}°C/${manila.current_condition[0].temp_F}°F`;

  }catch(err){
    console.log("temperature failed");
  }
}

updateTemps();
setInterval(updateTemps,1800000);
