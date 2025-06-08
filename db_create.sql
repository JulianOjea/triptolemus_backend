-- public.category definition

-- Drop table

-- DROP TABLE public.category;

CREATE TABLE public.category (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	icon varchar(255) NULL,
	CONSTRAINT category_pkey PRIMARY KEY (id)
);


-- public.token_fcm definition

-- Drop table

-- DROP TABLE public.token_fcm;

CREATE TABLE public.token_fcm (
	id serial4 NOT NULL,
	"token" varchar(255) NOT NULL,
	registration_date timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT token_fcm_pkey PRIMARY KEY (id)
);


-- public.user_admin definition

-- Drop table

-- DROP TABLE public.user_admin;

CREATE TABLE public.user_admin (
	user_id int4 DEFAULT nextval('user_admin_id_usuario_seq'::regclass) NOT NULL,
	"password" varchar(255) NOT NULL,
	user_name varchar(50) NULL,
	CONSTRAINT user_admin_pkey PRIMARY KEY (user_id),
	CONSTRAINT user_admin_user_name_key UNIQUE (user_name)
);


-- public.question definition

-- Drop table

-- DROP TABLE public.question;

CREATE TABLE public.question (
	id serial4 NOT NULL,
	text_es text NOT NULL,
	category_id int4 NULL,
	user_name text NULL,
	creation_date date DEFAULT CURRENT_DATE NULL,
	text_eng varchar NULL,
	CONSTRAINT question_pkey PRIMARY KEY (id),
	CONSTRAINT question_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id)
);