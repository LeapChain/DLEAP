module.exports = {
  /**
   *
   * @param {string} s
   * @returns {string}
   */
  snakeToCamel(s) {
    return s
      .split("_")
      .reduce(
        (acc, cur, i) =>
          `${acc}${
            i === 0 ? cur.charAt(0) : cur.charAt(0).toUpperCase()
          }${cur.slice(1)}`,
        ""
      );
  },
  /**
   *
   * @param {string} s
   * @returns {string}
   */
  snakeToPascal(s) {
    return s
      .split("_")
      .reduce(
        (acc, cur) => `${acc}${cur.charAt(0).toUpperCase()}${cur.slice(1)}`,
        ""
      );
  },

  /**
   * @param {string} s
   * @returns {string}
   */
  pascalToCamel(s) {
    return `${s.charAt(0).toLowerCase()}${s.slice(1)}`;
  },

  /**
   * @param {string} s
   * @returns {string}
   */
  camelToPascal(s) {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  },
};
