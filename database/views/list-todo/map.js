function(doc) {
  if (doc.class && doc.class.indexOf('task') > -1 && !doc.deleted && doc.class.indexOf('goal')==-1) {
    var x = doc.importance;
    if (x==undefined) x = 4;
    emit([doc.completed || false, x], doc);
  }
};