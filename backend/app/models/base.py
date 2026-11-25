from sqlalchemy import MetaData
from sqlalchemy.orm import declarative_base

metadata = MetaData(schema="laboratorio")
Base = declarative_base(metadata=metadata)
