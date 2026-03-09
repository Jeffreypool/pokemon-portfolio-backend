export default async function handler(req, res) {

  const response = await fetch(
    "https://pokemon-tcg-api.p.rapidapi.com/cards?per_page=1&page=1",
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "pokemon-tcg-api.p.rapidapi.com"
      }
    }
  );

  const data = await response.json();

  res.json(data);

}
