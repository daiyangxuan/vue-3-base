export const setSelectMaxLengthById = (id = "", maxLength = "50") => {
  const selectEle = document.getElementById(id);
  selectEle?.setAttribute("maxLength", maxLength);
};

export const filterOptionsMultiKeywords = (
  input: string,
  option: any,
  keys = ["label"]
) => {
  const keywords = input
    .toLowerCase()
    .split(" ")
    .filter((el) => el);
  return keywords.every((el) => {
    const res: boolean[] = [];
    keys.forEach((key) => {
      res.push(option[key]?.toLowerCase().indexOf(el) >= 0);
    });
    return res.some((el) => el);
  });
};

export const filterOptions = (input: string, option: any, key = "label") => {
  return option[key].toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
