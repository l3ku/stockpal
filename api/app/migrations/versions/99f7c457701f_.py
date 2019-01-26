"""empty message

Revision ID: 99f7c457701f
Revises: 6dcc3911f13d
Create Date: 2019-01-23 23:05:33.849538

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '99f7c457701f'
down_revision = '6dcc3911f13d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('o_auth2_token',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=20), nullable=False),
    sa.Column('token_type', sa.String(length=20), nullable=True),
    sa.Column('access_token', sa.String(length=48), nullable=False),
    sa.Column('refresh_token', sa.String(length=48), nullable=True),
    sa.Column('expires_at', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('o_auth2_token')
    # ### end Alembic commands ###