export default async function handler(req, res) {

  const response = await fetch("https://pokemon-prices.p.rapidapi.com/product/evolving-skies-booster-box", {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "pokemon-prices.p.rapidapi.com"
    }
  });

  const data = await response.json();

  res.json(data);

}
