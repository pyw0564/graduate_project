use GraduateProject;
GO

drop table algorithms

CREATE TABLE algorithms(
	name NVARCHAR(100) NOT NULL,
	tableName NVARCHAR(100) NOT NULL,
	constraint PK_algorithm PRIMARY KEY(name, tableName)
)

DELETE FROM algorithms;

INSERT INTO algorithms VALUES('기본 알고리즘', 'basicAlgorithm')
INSERT INTO algorithms VALUES('고급 알고리즘', 'advancedAlgorithm')
INSERT INTO algorithms VALUES('안고급 알고리즘', 'notadvancedAlgorithm')
INSERT INTO algorithms VALUES('안고급 알고리즘2', 'not2advancedAlgorithm')

GO


drop table basicAlgorithm
CREATE TABLE basicAlgorithm (
	name NVARCHAR(100) NOT NULL,
	tableName NVARCHAR(100) NOT NULL
	constraint PK_basicAlgorithm PRIMARY KEY(name, tableName)
)
INSERT INTO basicAlgorithm VALUES('완전탐색', 'exhaustive')
GO


CREATE TABLE exhaustive(
	name NVARCHAR(100) NOT NULL,
	_type NVARCHAR(100) NOT NULL,
	_file NVARCHAR(MAX),
	link NVARCHAR(MAX)
)
GO

SELECT * FROM algorithms;
SELECT * FROM basicAlgorithm;
SELECT * FROM exhaustive;
GO
