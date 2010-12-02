function(doc) {
  if (doc.class && doc.class.indexOf('task') > -1) {
    emit([doc.completed || false, doc.importance || 4], doc);
  }
};