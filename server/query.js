const db = require("../db");

const getUser = (hash) =>
  db("users")
    .where("hash", hash)
    .then((users) => (users.length > 0 ? users[0] : null));

const deleteUser = (hash) =>
  db("users")
    .where("hash", hash)
    .del();

const addUser = (hash, username, email) =>
  db("users")
    .insert({ hash, username, email })
    .returning("*")
    .then((arr) => arr[0]);

const incrementExp = (idToken, exp) =>
  db("users")
    .where("id_token", idToken)
    .increment("exp", exp);

const getLocationsWithRallyInfo = () =>
  db("rallies")
    .select(
      "locations.rally_id",
      "rallies.title",
      "rallies.description",
      "rallies.start_datetime",
      "rallies.end_datetime",
      "rallies.users_count",
      "locations.id",
      "locations.name",
      "locations.description as ldescription",
      "locations.lat",
      "locations.lng",
      "creators.username"
    )
    .innerJoin("locations", "rallies.id", "locations.rally_id")
    .innerJoin("creators", "rallies.creator_id", "creators.id");

const getRalliesOfUser = (userId) =>
  db("rallies")
    .innerJoin("rallies_to_users", "rallies.id", "rallies_to_users.rally_id")
    .where("rallies_to_users.user_id", userId);

const getLocationsWithRallyInfoUserChoose = (userId) =>
  db("rallies")
    .select(
      "locations.rally_id",
      "rallies.title",
      "rallies.description",
      "rallies.start_datetime",
      "rallies.end_datetime",
      "rallies.users_count",
      "creators.username",
      "locations.id",
      "locations.name",
      "locations.description as ldescription",
      "locations.lat",
      "locations.lng",
      "locations_to_users.visited"
    )
    .innerJoin("locations", "rallies.id", "locations.rally_id")
    .innerJoin("rallies_to_users", "rallies.id", "rallies_to_users.rally_id")
    .innerJoin(
      "locations_to_users",
      "locations.id",
      "locations_to_users.location_id"
    )
    .innerJoin("creators", "rallies.creator_id", "creators.id")
    .where("rallies_to_users.user_id", userId)
    .where("locations_to_users.user_id", userId);

const getLocationsOfRallyOfUser = (userId, rallyId) =>
  db("locations")
    .where("rally_id", rallyId)
    .innerJoin(
      "locations_to_users",
      "locations.id",
      "locations_to_users.location_id"
    )
    .where("user_id", userId);

const getLocationsOfRally = (rallyId) =>
  db("locations").where("rally_id", rallyId);

const doneLocation = (userId, locationId, visited) =>
  db("locations_to_users")
    .where("user_id", userId)
    .where("location_id", locationId)
    .update("visited", visited);

const insertRalliesToUsers = (userId, rallyId) =>
  db("rallies_to_users")
    .insert({
      user_id: userId,
      rally_id: rallyId,
    })
    .then(() => {
      db("rallies")
        .where("id", rallyId)
        .increment("users_count", 1);
    });

const insertLocationsToUsers = (data) => db("locations_to_users").insert(data);

const deleteRalliesToUsers = (userId, rallyId) =>
  db("rallies_to_users")
    .where("user_id", userId)
    .where("rally_id", rallyId)
    .del()
    .then(() => {
      db("rallies")
        .where("id", rallyId)
        .decrement("users_count", 1);
    });

const deleteLocationsToUsers = (userId, locations) =>
  db("locations_to_users")
    .where("user_id", userId)
    .whereIn("location_id", locations)
    .del();

const addRally = (title, description) =>
  db("rallies")
    .insert({ title, description })
    .returning("id")
    .then((ids) => ids[0]);

const addLocations = (locations) => db("locations").insert(locations);

module.exports = {
  getUser,
  addUser,
  deleteUser,
  getLocationsWithRallyInfo,
  getRalliesOfUser,
  getLocationsOfRallyOfUser,
  doneLocation,
  getLocationsWithRallyInfoUserChoose,
  getLocationsOfRally,
  deleteRalliesToUsers,
  deleteLocationsToUsers,
  insertRalliesToUsers,
  insertLocationsToUsers,
  addRally,
  addLocations,
  incrementExp,
};
