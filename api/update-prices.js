// Zoek prijs bij "From"
const fromBlock = html.split('From</dt>')[1];

if (!fromBlock) {
  results.push({
    item: item.name,
    status: 'No price found'
  });
  continue;
}

// Pak eerste € bedrag na From
const euroMatch = fromBlock.match(/([\d\.,]+)\s?€/);

if (!euroMatch) {
  results.push({
    item: item.name,
    status: 'No price found'
  });
  continue;
}

const price = parseFloat(
  euroMatch[1]
    .replace(/\./g, '')
    .replace(',', '.')
);

if (isNaN(price)) {
  results.push({
    item: item.name,
    status: 'Invalid price format'
  });
  continue;
}
