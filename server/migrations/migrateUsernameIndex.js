const mongoose = require("mongoose");
require("dotenv").config();
const { getMongoUri } = require("../config/env");

const COLLECTION = "users";
const NEW_INDEX_FIELDS = { username: 1 };
const NEW_INDEX_OPTIONS = {
  unique: true,
  collation: { locale: "en", strength: 2 },
};

const hasUsernameKey = (keyObj) =>
  keyObj && Object.keys(keyObj).length === 1 && keyObj.username !== undefined;

const isCorrectCollationIndex = (idx) =>
  hasUsernameKey(idx.key) &&
  idx.collation &&
  idx.collation.strength === 2;

const migrate = async () => {
  await mongoose.connect(getMongoUri());
  console.log("MongoDB povezan.");

  const collection = mongoose.connection.collection(COLLECTION);

  // 1. List all indexes so we can see what exists
  const indexes = await collection.indexes();
  console.log("\nPostojeći indexi:");
  for (const idx of indexes) {
    console.log(
      `  name: "${idx.name}", key: ${JSON.stringify(idx.key)}, unique: ${idx.unique ?? false}, collation: ${idx.collation ? `strength=${idx.collation.strength}` : "none"}`,
    );
  }

  // 2. Find ALL username indexes that are NOT the correct collation index
  const badIndexes = indexes.filter(
    (idx) => hasUsernameKey(idx.key) && !isCorrectCollationIndex(idx),
  );

  // 3. Drop them all
  if (badIndexes.length > 0) {
    for (const idx of badIndexes) {
      console.log(`\nBrisanje indexa "${idx.name}" (key: ${JSON.stringify(idx.key)}, collation: ${idx.collation ? `strength=${idx.collation.strength}` : "none"})...`);
      await collection.dropIndex(idx.name);
      console.log(`  Index "${idx.name}" obrisan.`);
    }
  } else {
    console.log("\nNema starih username indexa za brisanje.");
  }

  // 4. Title-case existing usernames
  console.log("\nTitle-case update svih korisničkih imena...");
  const cursor = collection.find({});
  let updated = 0;
  for await (const doc of cursor) {
    const original = doc.username;
    if (typeof original !== "string" || !original) continue;
    const titleCased =
      original.charAt(0).toUpperCase() + original.slice(1).toLowerCase();
    if (titleCased !== original) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { username: titleCased } },
      );
      updated++;
      console.log(`  "${original}" → "${titleCased}"`);
    }
  }
  console.log(`Ažurirano ${updated} korisničkih imena.`);

  // 5. Check if correct index already exists, create if not
  const refreshedIndexes = await collection.indexes();
  const hasCorrectIndex = refreshedIndexes.some(isCorrectCollationIndex);

  if (hasCorrectIndex) {
    console.log("\nIspravan collation index već postoji.");
  } else {
    console.log("\nKreiranje novog indexa s collation...");
    await collection.createIndex(NEW_INDEX_FIELDS, NEW_INDEX_OPTIONS);
    console.log("Novi index kreiran.");
  }

  // 6. Show final state
  const finalIndexes = await collection.indexes();
  console.log("\nZavršno stanje indexa:");
  for (const idx of finalIndexes) {
    console.log(
      `  name: "${idx.name}", key: ${JSON.stringify(idx.key)}, unique: ${idx.unique ?? false}, collation: ${idx.collation ? `strength=${idx.collation.strength}` : "none"}`,
    );
  }

  await mongoose.connection.close();
  console.log("\nMigracija završena.");
};

migrate().catch((error) => {
  console.error("Greška pri migraciji:", error);
  process.exit(1);
});
