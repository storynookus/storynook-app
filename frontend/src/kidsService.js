// Simple localStorage-based kids service — no Firebase needed

function getKidsFromStorage() {
  try {
    const data = localStorage.getItem('storyspark_kids');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveKidsToStorage(kids) {
  localStorage.setItem('storyspark_kids', JSON.stringify(kids));
}

export async function saveKid(kidData) {
  const kids = getKidsFromStorage();
  const newKid = {
    id: `kid_${Date.now()}`,
    name: kidData.name,
    age: kidData.age,
    photo: kidData.photo || null,
    photoPreview: kidData.photoPreview || null,
    createdAt: new Date().toISOString(),
  };
  kids.push(newKid);
  saveKidsToStorage(kids);
  console.log("Saved kid:", newKid.id);
  return newKid;
}

export async function getKids() {
  return getKidsFromStorage();
}

export async function deleteKid(kidId) {
  const kids = getKidsFromStorage().filter(k => k.id !== kidId);
  saveKidsToStorage(kids);
}
