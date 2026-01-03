from app import db
from app.models.base import BaseModel


class Vendor(BaseModel):
    """
    供应商主数据表

    说明：
    - 继承 BaseModel，主键为 guid（UUID 字符串）
    - 这里的字段设计与前端供应商管理页面保持一致，便于直接返回给前端使用
    """

    __tablename__ = "vendors"

    # 基础信息
    name = db.Column(db.String(100), nullable=False)  # 供应商名称
    code = db.Column(db.String(50), nullable=False, unique=True)  # 例如 SUP-001

    # 联系方式
    contact = db.Column(db.String(100), nullable=True)  # 联系人
    phone = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    address = db.Column(db.String(255), nullable=True)

    # 分类与状态
    category = db.Column(db.String(100), nullable=True)  # 供应商类别，如“原材料供应商”
    rating = db.Column(db.Integer, default=5)  # 简单星级 1-5
    status = db.Column(db.String(20), default="active")  # active / inactive

    # 供应商简介
    description = db.Column(db.Text, nullable=True)

