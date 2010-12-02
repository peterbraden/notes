function(doc) {
  if (doc.class && doc.class.indexOf('task') > -1 && !doc.deleted) {
    emit([doc.completed || false, doc.importance || 4], doc);
  }
};