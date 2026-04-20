--
-- VedicProtocol Indexes (Schema: public)
-- Performance indexes on public schema tables
--

--
-- Name: appt_customer_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX appt_customer_idx ON public.appointments USING btree (customer_id);


--
-- Name: loyalty_customer_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX loyalty_customer_idx ON public.loyalty_points USING btree (customer_id);


--
-- Name: orders_customer_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX orders_customer_idx ON public.orders USING btree (customer_id);


--
-- Name: slots_doctor_date_idx; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX slots_doctor_date_idx ON public.availability_slots USING btree (doctor_id, date);
