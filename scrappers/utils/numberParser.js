const parseNumber = number => {
  if(!number){
    return 0;
  }

  const result = number.replace(/\D/g, '');
  return (result == '' ? 0 : Number.parseInt(result));
}

module.exports = parseNumber;
