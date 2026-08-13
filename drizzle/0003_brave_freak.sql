CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`description` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_entity_type_idx` ON `activity_logs` (`entity_type`);--> statement-breakpoint
CREATE INDEX `activity_logs_entity_id_idx` ON `activity_logs` (`entity_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_created_at_idx` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `disposition_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`disposition_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`action` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`disposition_id`) REFERENCES `dispositions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `disposition_logs_disposition_id_idx` ON `disposition_logs` (`disposition_id`);--> statement-breakpoint
CREATE INDEX `disposition_logs_user_id_idx` ON `disposition_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `disposition_recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`disposition_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`disposition_id`) REFERENCES `dispositions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `disposition_recipients_disposition_id_idx` ON `disposition_recipients` (`disposition_id`);--> statement-breakpoint
CREATE INDEX `disposition_recipients_user_id_idx` ON `disposition_recipients` (`user_id`);--> statement-breakpoint
CREATE INDEX `disposition_recipients_status_idx` ON `disposition_recipients` (`status`);--> statement-breakpoint
CREATE TABLE `dispositions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`incoming_letter_id` integer NOT NULL,
	`from_user_id` integer NOT NULL,
	`instruction` text NOT NULL,
	`note` text,
	`deadline` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`incoming_letter_id`) REFERENCES `incoming_letters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `dispositions_incoming_letter_id_idx` ON `dispositions` (`incoming_letter_id`);--> statement-breakpoint
CREATE INDEX `dispositions_from_user_id_idx` ON `dispositions` (`from_user_id`);--> statement-breakpoint
CREATE INDEX `dispositions_status_idx` ON `dispositions` (`status`);--> statement-breakpoint
CREATE INDEX `dispositions_deadline_idx` ON `dispositions` (`deadline`);--> statement-breakpoint
CREATE TABLE `document_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_categories_code_unique` ON `document_categories` (`code`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`incoming_letter_id` integer,
	`outgoing_letter_id` integer,
	`document_number` text,
	`title` text NOT NULL,
	`document_date` text,
	`year` integer,
	`description` text,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `document_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`incoming_letter_id`) REFERENCES `incoming_letters`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`outgoing_letter_id`) REFERENCES `outgoing_letters`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `documents_category_id_idx` ON `documents` (`category_id`);--> statement-breakpoint
CREATE INDEX `documents_document_number_idx` ON `documents` (`document_number`);--> statement-breakpoint
CREATE INDEX `documents_year_idx` ON `documents` (`year`);--> statement-breakpoint
CREATE INDEX `documents_document_date_idx` ON `documents` (`document_date`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` integer,
	`incoming_letter_id` integer,
	`outgoing_letter_id` integer,
	`file_name` text NOT NULL,
	`drive_file_id` text NOT NULL,
	`drive_folder_id` text,
	`mime_type` text,
	`file_size` integer,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`incoming_letter_id`) REFERENCES `incoming_letters`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`outgoing_letter_id`) REFERENCES `outgoing_letters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_drive_file_id_unique` ON `files` (`drive_file_id`);--> statement-breakpoint
CREATE INDEX `files_drive_file_id_idx` ON `files` (`drive_file_id`);--> statement-breakpoint
CREATE INDEX `files_document_id_idx` ON `files` (`document_id`);--> statement-breakpoint
CREATE INDEX `files_incoming_letter_id_idx` ON `files` (`incoming_letter_id`);--> statement-breakpoint
CREATE INDEX `files_outgoing_letter_id_idx` ON `files` (`outgoing_letter_id`);--> statement-breakpoint
CREATE TABLE `incoming_letters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agenda_number` text,
	`letter_number` text NOT NULL,
	`letter_date` text NOT NULL,
	`received_date` text NOT NULL,
	`sender` text NOT NULL,
	`subject` text NOT NULL,
	`classification` text,
	`priority` text NOT NULL,
	`attachment_count` integer DEFAULT 0,
	`description` text,
	`status` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `incoming_letters_agenda_number_idx` ON `incoming_letters` (`agenda_number`);--> statement-breakpoint
CREATE INDEX `incoming_letters_letter_number_idx` ON `incoming_letters` (`letter_number`);--> statement-breakpoint
CREATE INDEX `incoming_letters_letter_date_idx` ON `incoming_letters` (`letter_date`);--> statement-breakpoint
CREATE INDEX `incoming_letters_received_date_idx` ON `incoming_letters` (`received_date`);--> statement-breakpoint
CREATE INDEX `incoming_letters_sender_idx` ON `incoming_letters` (`sender`);--> statement-breakpoint
CREATE INDEX `incoming_letters_status_idx` ON `incoming_letters` (`status`);--> statement-breakpoint
CREATE INDEX `incoming_letters_classification_idx` ON `incoming_letters` (`classification`);--> statement-breakpoint
CREATE TABLE `outgoing_letters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`letter_number` text NOT NULL,
	`letter_date` text NOT NULL,
	`recipient` text NOT NULL,
	`subject` text NOT NULL,
	`classification` text,
	`priority` text NOT NULL,
	`attachment_count` integer DEFAULT 0,
	`description` text,
	`status` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `outgoing_letters_letter_number_idx` ON `outgoing_letters` (`letter_number`);--> statement-breakpoint
CREATE INDEX `outgoing_letters_letter_date_idx` ON `outgoing_letters` (`letter_date`);--> statement-breakpoint
CREATE INDEX `outgoing_letters_recipient_idx` ON `outgoing_letters` (`recipient`);--> statement-breakpoint
CREATE INDEX `outgoing_letters_status_idx` ON `outgoing_letters` (`status`);--> statement-breakpoint
CREATE INDEX `outgoing_letters_classification_idx` ON `outgoing_letters` (`classification`);