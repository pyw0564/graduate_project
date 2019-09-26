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

INSERT INTO algorithms VALUES('sub','기본 알고리즘', 'basicAlgorithm', '')
INSERT INTO algorithms VALUES('sub','고급 알고리즘', 'advancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','안고급 알고리즘', 'notadvancedAlgorithm', '')
INSERT INTO algorithms VALUES('sub','안고급 알고리즘2', 'not2advancedAlgorithm', '')

GO


drop table basicAlgorithm
CREATE TABLE basicAlgorithm(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)
INSERT INTO basicAlgorithm VALUES('sub','완전탐색','exhaustive','')
GO


drop table exhaustive
CREATE TABLE exhaustive(
	_type NVARCHAR(100) NOT NULL,
	name NVARCHAR(100),
	tableName NVARCHAR(100),
	content NVARCHAR(MAX)
)

