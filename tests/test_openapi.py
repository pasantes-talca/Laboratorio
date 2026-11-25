import warnings

from main import app


def test_openapi_has_unique_operation_ids():
    with warnings.catch_warnings(record=True) as captured:
        schema = app.openapi()
    operation_ids = [
        operation["operationId"]
        for path in schema["paths"].values()
        for operation in path.values()
        if isinstance(operation, dict) and "operationId" in operation
    ]
    assert len(operation_ids) == len(set(operation_ids))
    assert not [warning for warning in captured if "Duplicate Operation ID" in str(warning.message)]
