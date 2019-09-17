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