const { v7: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const getCoordsForAddress = require("../util/geocode");
const Journal = require("../models/journal");
const HttpError = require("../models/http-error");

const getEntryById = async (req, res, next) => {
  const entryId = req.params.pid;

  let entry;
  try {
    entry = await Journal.findById(entryId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find an entry.",
      500
    );
    return next(error);
  }

  if (!entry) {
    const error = new HttpError(
      "Could not find an entry for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ entry: entry.toObject({ getters: true }) });
};

const getEntriesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  console.log("========== getEntriesByUserId START ==========");
  console.log("1. Function called - Fetching entries for user:", userId);
  console.log("2. Request params received:", req.params);

  let entries;
  try {
    console.log("3. About to query database with author:", userId);
    entries = await Journal.find({ author: userId });
    console.log("4. Database query completed");
    console.log("5. Database result:", entries);
    console.log("6. Number of entries found:", entries ? entries.length : 0);
    console.log("7. Does this userId match entry.author?");
    
    if (entries && entries.length > 0) {
      console.log("8. Sample entry author field:", entries[0].author);
      console.log("9. Are they equal?", entries[0].author.toString() === userId);
    }
  } catch (err) {
    console.error("ERROR in database query:", err);
    const error = new HttpError(
      "Fetching entries failed, please try again later",
      500
    );
    return next(error);
  }

  if (!entries || entries.length === 0) {
    console.log("10. No entries found - returning empty array");
  } else {
    console.log("11. Entries found - preparing response");
  }

  console.log("12. Sending response with entries");
  res.json({
    entries: entries.map((entry) => entry.toObject({ getters: true })),
  });
  console.log("========== getEntriesByUserId END ==========");
};

const createEntry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { headline, journalText, locationName, author } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(locationName);
  } catch (error) {
    return next(error);
  }

  const createdEntry = new Journal({
    id: uuid(),
    headline,
    journalText,
    photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpPkm3Hhfm2fa7zZFgK0HQrD8yvwSBmnm_Gw&s",
    locationName,
    coordinates: {
        latitude: coordinates.lat, 
        longitude: coordinates.lng
    },
    author,
  });

  try {
    await createdEntry.save();
  } catch (err) {
    const error = new HttpError("Creating entry failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ entry: createdEntry });
};

const updateEntry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { headline, journalText } = req.body;
  const entryId = req.params.pid;

  console.log("========== updateEntry START ==========");
  console.log("1. Update entry called for ID:", entryId);
  console.log("2. Update payload received:", { headline, journalText });
  console.log("3. Full request body:", req.body);

  let entry;
  try {
    console.log("4. Attempting to find entry by ID:", entryId);
    entry = await Journal.findById(entryId);
    console.log("5. Entry found:", entry ? "Yes" : "No");
    if (entry) {
      console.log("6. Current entry data:", entry.toObject());
    }
  } catch (err) {
    console.error("ERROR finding entry:", err);
    const error = new HttpError(
      "Something went wrong, could not update entry.",
      500
    );
    return next(error); 
  }

  console.log("7. Updating entry fields...");
  entry.headline = headline;
  entry.journalText = journalText;
  console.log("8. Entry fields updated in memory");

  try {
    console.log("9. Attempting to save updated entry to database...");
    await entry.save();
    console.log("10. Entry saved successfully");
  } catch (err) {
    console.error("ERROR saving entry:", err);
    const error = new HttpError(
      "Something went wrong, could not update entry.",
      500
    );
    return next(error);
  }

  console.log("11. Sending success response");
  res.status(200).json({ entry: entry.toObject({ getters: true }) });
  console.log("========== updateEntry END ==========");
};

const deleteEntry = async (req, res, next) => {
  const entryId = req.params.pid;

  console.log("========== deleteEntry START ==========");
  console.log("1. Delete entry called for ID:", entryId);
  console.log("2. Request params:", req.params);

  let entry;
  try {
    console.log("3. Attempting to find entry by ID:", entryId);
    entry = await Journal.findById(entryId);
    console.log("4. Entry found:", entry ? "Yes" : "No");
    if (entry) {
      console.log("5. Entry to delete:", entry.toObject());
    }
  } catch (err) {
    console.error("ERROR finding entry:", err);
    const error = new HttpError(
      "Something went wrong, could not delete entry.",
      500
    );
    return next(error);
  }

  if (!entry) {
    console.log("6. Entry not found - returning 404 error");
    return next(new HttpError("Could not find entry for this id.", 404));
  }

  try {
    console.log("7. Attempting to delete entry from database...");
    await entry.deleteOne();
    console.log("8. Entry deleted successfully");
  } catch (err) {
    console.error("ERROR deleting entry:", err);
    const error = new HttpError(
      "Something went wrong, could not delete entry.",
      500
    );
    return next(error);
  }

  console.log("9. Sending success response");
  res.status(200).json({ message: "Deleted entry." });
  console.log("========== deleteEntry END ==========");
};

exports.getEntryById = getEntryById;
exports.getEntriesByUserId = getEntriesByUserId;
exports.createEntry = createEntry;
exports.updateEntry = updateEntry;
exports.deleteEntry = deleteEntry;