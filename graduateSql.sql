use GraduateProject;
GO

drop table algorithms

CREATE TABLE algorithms(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)

DELETE FROM algorithms;
DELETE FROM algorithms WHERE _type = 'content';

INSERT INTO algorithms VALUES('sub','�⺻ �˰���', 'basicAlgorithm', '')
INSERT INTO algorithms VALUES('sub','��� �˰���', 'advancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','�Ȱ�� �˰���', 'notadvancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','�Ȱ�� �˰���2', 'not2advancedAlgorithm', '')

GO


drop table basicAlgorithm
CREATE TABLE basicAlgorithm(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO basicAlgorithm VALUES('sub','����Ž��','exhaustive','')
GO


drop table exhaustive
CREATE TABLE exhaustive(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)

