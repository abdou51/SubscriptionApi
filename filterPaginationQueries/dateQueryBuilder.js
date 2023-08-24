module.exports = {
  buildQuery: function(year, month, day) {
    let query = {};

    if (year && month && day) {
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (year && month) {
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    return query;
  }
};
