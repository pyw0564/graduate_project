use GraduateProject;
GO

CREATE TABLE algorithms(
	name NVARCHAR(100) NOT NULL,
	tableName NVARCHAR(100) NOT NULL
)
GO

CREATE TABLE basic (
	name NVARCHAR(100) NOT NULL,
	tableName NVARCHAR(100) NOT NULL
)
GO

CREATE TABLE exhaustive(
	name NVARCHAR(100) NOT NULL,
	_type NVARCHAR(100) NOT NULL,
	_file NVARCHAR(MAX),
	link NVARCHAR(MAX)
)
GO

SELECT * FROM algorithms;
SELECT * FROM basic;
SELECT * FROM exhaustive;
GO

DELETE FROM algorithms;

INSERT INTO algorithms VALUES('기본 알고리즘', 'basicAlgorithm')
INSERT INTO algorithms VALUES('고급 알고리즘', 'advancedAlgorithm')
INSERT INTO algorithms VALUES('안고급 알고리즘', 'notadvancedAlgorithm')

