from strawberry.extensions import SchemaExtension
from sqlalchemy import event

class QueryCounter(SchemaExtension):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.queries = []

    def get_results(self):
        return {
            "queryCount": len(self.queries),
            # "queries": self.queries,
        }

    def callback(self, *args, **kwargs):
        self.queries.append((args[2], args[3]))
        if len(self.queries) > 20:  # pragma: no cover
            raise Exception("Too many queries!")

    def on_operation(self):
        conn = self.execution_context.context["db"].connection()
        event.listen(conn, "before_cursor_execute", self.callback)
        yield
        event.remove(conn, "before_cursor_execute", self.callback)
