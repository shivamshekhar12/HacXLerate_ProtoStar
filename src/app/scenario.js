// This compares raw measurements only; it is not a prediction or score model.
export function compareScenario(student, values) {
  const copy = structuredClone(student);
  const bounds = { attendance: 100, placement: 100, lms: 6 };
  for (const [id, max] of Object.entries(bounds)) {
    if (!Number.isInteger(values[id]) || values[id] < 0 || values[id] > max) throw new RangeError(`Invalid ${id} scenario`);
    copy.domains.find(d => d.id === id).value = values[id];
  }
  return Object.keys(bounds).map(id => {
    const baseline = student.domains.find(d => d.id === id);
    const scenario = copy.domains.find(d => d.id === id);
    return { id, name: baseline.name, baseline: baseline.value, scenario: scenario.value, delta: scenario.value - baseline.value, unit: baseline.unit };
  });
}
