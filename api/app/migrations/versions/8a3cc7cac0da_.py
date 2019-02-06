"""empty message

Revision ID: 8a3cc7cac0da
Revises: 757d29477eea
Create Date: 2019-02-06 22:11:38.366879

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '8a3cc7cac0da'
down_revision = '757d29477eea'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('taskset_id', table_name='celery_tasksetmeta')
    op.drop_table('celery_tasksetmeta')
    op.drop_index('task_id', table_name='celery_taskmeta')
    op.drop_table('celery_taskmeta')
    op.drop_index('symbol', table_name='stock')
    op.drop_table('stock')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('stock',
    sa.Column('id', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('symbol', mysql.VARCHAR(length=20), nullable=False),
    sa.Column('name', mysql.VARCHAR(length=200), nullable=False),
    sa.Column('is_enabled', mysql.TINYINT(display_width=1), autoincrement=False, nullable=True),
    sa.CheckConstraint('`is_enabled` in (0,1)', name='CONSTRAINT_1'),
    sa.PrimaryKeyConstraint('id'),
    mysql_default_charset='latin1',
    mysql_engine='InnoDB'
    )
    op.create_index('symbol', 'stock', ['symbol'], unique=True)
    op.create_table('celery_taskmeta',
    sa.Column('id', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('task_id', mysql.VARCHAR(length=155), nullable=True),
    sa.Column('status', mysql.VARCHAR(length=50), nullable=True),
    sa.Column('result', sa.BLOB(), nullable=True),
    sa.Column('date_done', mysql.DATETIME(), nullable=True),
    sa.Column('traceback', mysql.TEXT(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_default_charset='latin1',
    mysql_engine='InnoDB'
    )
    op.create_index('task_id', 'celery_taskmeta', ['task_id'], unique=True)
    op.create_table('celery_tasksetmeta',
    sa.Column('id', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('taskset_id', mysql.VARCHAR(length=155), nullable=True),
    sa.Column('result', sa.BLOB(), nullable=True),
    sa.Column('date_done', mysql.DATETIME(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_default_charset='latin1',
    mysql_engine='InnoDB'
    )
    op.create_index('taskset_id', 'celery_tasksetmeta', ['taskset_id'], unique=True)
    # ### end Alembic commands ###