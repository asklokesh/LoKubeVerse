from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

def upgrade():
    op.create_table('tenants',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('users',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', pg.UUID(as_uuid=True), sa.ForeignKey('tenants.id')),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), default='user'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('clusters',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', pg.UUID(as_uuid=True), sa.ForeignKey('tenants.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('cloud', sa.String(), nullable=False),
        sa.Column('config', sa.JSON()),
        sa.Column('status', sa.String()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('namespaces',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('workloads',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('namespace_id', pg.UUID(as_uuid=True), sa.ForeignKey('namespaces.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('spec', sa.JSON()),
        sa.Column('status', sa.String()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('rbac',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('rules', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('quotas',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('namespace_id', pg.UUID(as_uuid=True), sa.ForeignKey('namespaces.id')),
        sa.Column('spec', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('network_policies',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('namespace_id', pg.UUID(as_uuid=True), sa.ForeignKey('namespaces.id')),
        sa.Column('spec', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('deployments',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('namespace_id', pg.UUID(as_uuid=True), sa.ForeignKey('namespaces.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('spec', sa.JSON()),
        sa.Column('status', sa.String()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_table('audit_logs',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', pg.UUID(as_uuid=True), sa.ForeignKey('tenants.id')),
        sa.Column('user_id', pg.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('action', sa.String()),
        sa.Column('resource', sa.String()),
        sa.Column('details', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_table('costs',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True),
        sa.Column('cluster_id', pg.UUID(as_uuid=True), sa.ForeignKey('clusters.id')),
        sa.Column('namespace_id', pg.UUID(as_uuid=True), sa.ForeignKey('namespaces.id'), nullable=True),
        sa.Column('amount', sa.Float()),
        sa.Column('currency', sa.String(), default='USD'),
        sa.Column('period', sa.String()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('costs')
    op.drop_table('audit_logs')
    op.drop_table('deployments')
    op.drop_table('network_policies')
    op.drop_table('quotas')
    op.drop_table('rbac')
    op.drop_table('workloads')
    op.drop_table('namespaces')
    op.drop_table('clusters')
    op.drop_table('users')
    op.drop_table('tenants') 