"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "categories",
      [
        {
          key: "programming",
          name: "プログラミング",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "career",
          name: "キャリア",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "hobby",
          name: "趣味",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
