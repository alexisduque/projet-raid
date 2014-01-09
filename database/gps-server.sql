-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- PostgreSQL version: 9.3
-- Project Site: pgmodeler.com.br
-- Model Author: ---

SET check_function_bodies = false;
-- ddl-end --


-- Database creation must be done outside an multicommand file.
-- These commands were put in this file only for convenience.
-- -- object: "gps-collect" | type: DATABASE --
-- CREATE DATABASE "gps-collect"
-- ;
-- -- ddl-end --
-- 

-- object: public.person | type: TABLE --
CREATE TABLE public.person(
	id smallint,
	firstname varchar(32),
	lastname varchar(32),
	blood_group varchar(4),
	phone varchar(16),
	id_team smallint,
	id_role smallint,
	CONSTRAINT pk5 PRIMARY KEY (id)

);
-- ddl-end --
-- object: public.team | type: TABLE --
CREATE TABLE public.team(
	id smallint,
	pseudo varchar(16),
	name varchar(32),
	company varchar(32),
	CONSTRAINT pk PRIMARY KEY (id)

);
-- ddl-end --
-- object: public.role | type: TABLE --
CREATE TABLE public.role(
	id smallint,
	name varchar(16),
	CONSTRAINT pk3 PRIMARY KEY (id)

);
-- ddl-end --
-- object: public.tracker | type: TABLE --
CREATE TABLE public.tracker(

);
-- ddl-end --

-- object: id | type: COLUMN --
ALTER TABLE public.tracker ADD COLUMN id smallint;
-- ddl-end --

-- object: manufacturer | type: COLUMN --
ALTER TABLE public.tracker ADD COLUMN manufacturer varchar(32);
-- ddl-end --

-- object: model | type: COLUMN --
ALTER TABLE public.tracker ADD COLUMN model varchar(32);
-- ddl-end --

-- object: id_person | type: COLUMN --
ALTER TABLE public.tracker ADD COLUMN id_person smallint;
-- ddl-end --

-- object: id_sim | type: COLUMN --
ALTER TABLE public.tracker ADD COLUMN id_sim smallint;
-- ddl-end --
-- object: pk4 | type: CONSTRAINT --
ALTER TABLE public.tracker ADD CONSTRAINT pk4 PRIMARY KEY (id);
-- ddl-end --


-- object: public.sim | type: TABLE --
CREATE TABLE public.sim(
	id smallint,
	imsi varchar(16),
	phone varchar(16),
	operator varchar(32),
	model varchar(16),
	CONSTRAINT pk6 PRIMARY KEY (id)

);
-- ddl-end --
-- object: public.location | type: TABLE --
CREATE TABLE public.location(
	tracker public.tracker,
	latitude double precision,
	longitude double precision,
	altitude double precision,
	speed smallint,
	heading smallint,
	time date,
	id_tracker smallint
);
-- ddl-end --
-- object: public.poi | type: TABLE --
CREATE TABLE public.poi(
	id smallint,
	name varchar(32),
	latitude double precision,
	longitude double precision,
	altitude double precision,
	id_path smallint,
	CONSTRAINT pk2 PRIMARY KEY (id)

);
-- ddl-end --
-- object: public.path | type: TABLE --
CREATE TABLE public.path(
	id smallint,
	name varchar(32),
	description varchar(128),
	CONSTRAINT pk1 PRIMARY KEY (id)

);
-- ddl-end --
-- object: tracker_fk | type: CONSTRAINT --
ALTER TABLE public.location ADD CONSTRAINT tracker_fk FOREIGN KEY (id_tracker)
REFERENCES public.tracker (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE NOT DEFERRABLE;
-- ddl-end --


-- object: team_fk | type: CONSTRAINT --
ALTER TABLE public.person ADD CONSTRAINT team_fk FOREIGN KEY (id_team)
REFERENCES public.team (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE NOT DEFERRABLE;
-- ddl-end --


-- object: path_fk | type: CONSTRAINT --
ALTER TABLE public.poi ADD CONSTRAINT path_fk FOREIGN KEY (id_path)
REFERENCES public.path (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE NOT DEFERRABLE;
-- ddl-end --


-- object: person_fk | type: CONSTRAINT --
ALTER TABLE public.tracker ADD CONSTRAINT person_fk FOREIGN KEY (id_person)
REFERENCES public.person (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE NOT DEFERRABLE;
-- ddl-end --


-- object: tracker_uq | type: CONSTRAINT --
ALTER TABLE public.tracker ADD CONSTRAINT tracker_uq UNIQUE (id_person);
-- ddl-end --


-- object: role_fk | type: CONSTRAINT --
ALTER TABLE public.person ADD CONSTRAINT role_fk FOREIGN KEY (id_role)
REFERENCES public.role (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE NOT DEFERRABLE;
-- ddl-end --


-- object: person_uq | type: CONSTRAINT --
ALTER TABLE public.person ADD CONSTRAINT person_uq UNIQUE (id_role);
-- ddl-end --


-- object: sim_fk | type: CONSTRAINT --
ALTER TABLE public.tracker ADD CONSTRAINT sim_fk FOREIGN KEY (id_sim)
REFERENCES public.sim (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE NOT DEFERRABLE;
-- ddl-end --


-- object: tracker_uq1 | type: CONSTRAINT --
ALTER TABLE public.tracker ADD CONSTRAINT tracker_uq1 UNIQUE (id_sim);
-- ddl-end --



