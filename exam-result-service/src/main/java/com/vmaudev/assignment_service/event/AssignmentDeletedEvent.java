/**
 * Autogenerated by Avro
 *
 * DO NOT EDIT DIRECTLY
 */
package com.vmaudev.assignment_service.event;

import org.apache.avro.generic.GenericArray;
import org.apache.avro.specific.SpecificData;
import org.apache.avro.util.Utf8;
import org.apache.avro.message.BinaryMessageEncoder;
import org.apache.avro.message.BinaryMessageDecoder;
import org.apache.avro.message.SchemaStore;

@org.apache.avro.specific.AvroGenerated
public class AssignmentDeletedEvent extends org.apache.avro.specific.SpecificRecordBase implements org.apache.avro.specific.SpecificRecord {
  private static final long serialVersionUID = 661007223369248033L;


  public static final org.apache.avro.Schema SCHEMA$ = new org.apache.avro.Schema.Parser().parse("{\"type\":\"record\",\"name\":\"AssignmentDeletedEvent\",\"namespace\":\"com.vmaudev.assignment_service.event\",\"fields\":[{\"name\":\"assignmentIds\",\"type\":{\"type\":\"array\",\"items\":\"string\"}}]}");
  public static org.apache.avro.Schema getClassSchema() { return SCHEMA$; }

  private static final SpecificData MODEL$ = new SpecificData();

  private static final BinaryMessageEncoder<AssignmentDeletedEvent> ENCODER =
      new BinaryMessageEncoder<>(MODEL$, SCHEMA$);

  private static final BinaryMessageDecoder<AssignmentDeletedEvent> DECODER =
      new BinaryMessageDecoder<>(MODEL$, SCHEMA$);

  /**
   * Return the BinaryMessageEncoder instance used by this class.
   * @return the message encoder used by this class
   */
  public static BinaryMessageEncoder<AssignmentDeletedEvent> getEncoder() {
    return ENCODER;
  }

  /**
   * Return the BinaryMessageDecoder instance used by this class.
   * @return the message decoder used by this class
   */
  public static BinaryMessageDecoder<AssignmentDeletedEvent> getDecoder() {
    return DECODER;
  }

  /**
   * Create a new BinaryMessageDecoder instance for this class that uses the specified {@link SchemaStore}.
   * @param resolver a {@link SchemaStore} used to find schemas by fingerprint
   * @return a BinaryMessageDecoder instance for this class backed by the given SchemaStore
   */
  public static BinaryMessageDecoder<AssignmentDeletedEvent> createDecoder(SchemaStore resolver) {
    return new BinaryMessageDecoder<>(MODEL$, SCHEMA$, resolver);
  }

  /**
   * Serializes this AssignmentDeletedEvent to a ByteBuffer.
   * @return a buffer holding the serialized data for this instance
   * @throws java.io.IOException if this instance could not be serialized
   */
  public java.nio.ByteBuffer toByteBuffer() throws java.io.IOException {
    return ENCODER.encode(this);
  }

  /**
   * Deserializes a AssignmentDeletedEvent from a ByteBuffer.
   * @param b a byte buffer holding serialized data for an instance of this class
   * @return a AssignmentDeletedEvent instance decoded from the given buffer
   * @throws java.io.IOException if the given bytes could not be deserialized into an instance of this class
   */
  public static AssignmentDeletedEvent fromByteBuffer(
      java.nio.ByteBuffer b) throws java.io.IOException {
    return DECODER.decode(b);
  }

  private java.util.List<java.lang.CharSequence> assignmentIds;

  /**
   * Default constructor.  Note that this does not initialize fields
   * to their default values from the schema.  If that is desired then
   * one should use <code>newBuilder()</code>.
   */
  public AssignmentDeletedEvent() {}

  /**
   * All-args constructor.
   * @param assignmentIds The new value for assignmentIds
   */
  public AssignmentDeletedEvent(java.util.List<java.lang.CharSequence> assignmentIds) {
    this.assignmentIds = assignmentIds;
  }

  @Override
  public org.apache.avro.specific.SpecificData getSpecificData() { return MODEL$; }

  @Override
  public org.apache.avro.Schema getSchema() { return SCHEMA$; }

  // Used by DatumWriter.  Applications should not call.
  @Override
  public java.lang.Object get(int field$) {
    switch (field$) {
    case 0: return assignmentIds;
    default: throw new IndexOutOfBoundsException("Invalid index: " + field$);
    }
  }

  // Used by DatumReader.  Applications should not call.
  @Override
  @SuppressWarnings(value="unchecked")
  public void put(int field$, java.lang.Object value$) {
    switch (field$) {
    case 0: assignmentIds = (java.util.List<java.lang.CharSequence>)value$; break;
    default: throw new IndexOutOfBoundsException("Invalid index: " + field$);
    }
  }

  /**
   * Gets the value of the 'assignmentIds' field.
   * @return The value of the 'assignmentIds' field.
   */
  public java.util.List<java.lang.CharSequence> getAssignmentIds() {
    return assignmentIds;
  }


  /**
   * Sets the value of the 'assignmentIds' field.
   * @param value the value to set.
   */
  public void setAssignmentIds(java.util.List<java.lang.CharSequence> value) {
    this.assignmentIds = value;
  }

  /**
   * Creates a new AssignmentDeletedEvent RecordBuilder.
   * @return A new AssignmentDeletedEvent RecordBuilder
   */
  public static com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder newBuilder() {
    return new com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder();
  }

  /**
   * Creates a new AssignmentDeletedEvent RecordBuilder by copying an existing Builder.
   * @param other The existing builder to copy.
   * @return A new AssignmentDeletedEvent RecordBuilder
   */
  public static com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder newBuilder(com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder other) {
    if (other == null) {
      return new com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder();
    } else {
      return new com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder(other);
    }
  }

  /**
   * Creates a new AssignmentDeletedEvent RecordBuilder by copying an existing AssignmentDeletedEvent instance.
   * @param other The existing instance to copy.
   * @return A new AssignmentDeletedEvent RecordBuilder
   */
  public static com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder newBuilder(com.vmaudev.assignment_service.event.AssignmentDeletedEvent other) {
    if (other == null) {
      return new com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder();
    } else {
      return new com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder(other);
    }
  }

  /**
   * RecordBuilder for AssignmentDeletedEvent instances.
   */
  @org.apache.avro.specific.AvroGenerated
  public static class Builder extends org.apache.avro.specific.SpecificRecordBuilderBase<AssignmentDeletedEvent>
    implements org.apache.avro.data.RecordBuilder<AssignmentDeletedEvent> {

    private java.util.List<java.lang.CharSequence> assignmentIds;

    /** Creates a new Builder */
    private Builder() {
      super(SCHEMA$, MODEL$);
    }

    /**
     * Creates a Builder by copying an existing Builder.
     * @param other The existing Builder to copy.
     */
    private Builder(com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder other) {
      super(other);
      if (isValidValue(fields()[0], other.assignmentIds)) {
        this.assignmentIds = data().deepCopy(fields()[0].schema(), other.assignmentIds);
        fieldSetFlags()[0] = other.fieldSetFlags()[0];
      }
    }

    /**
     * Creates a Builder by copying an existing AssignmentDeletedEvent instance
     * @param other The existing instance to copy.
     */
    private Builder(com.vmaudev.assignment_service.event.AssignmentDeletedEvent other) {
      super(SCHEMA$, MODEL$);
      if (isValidValue(fields()[0], other.assignmentIds)) {
        this.assignmentIds = data().deepCopy(fields()[0].schema(), other.assignmentIds);
        fieldSetFlags()[0] = true;
      }
    }

    /**
      * Gets the value of the 'assignmentIds' field.
      * @return The value.
      */
    public java.util.List<java.lang.CharSequence> getAssignmentIds() {
      return assignmentIds;
    }


    /**
      * Sets the value of the 'assignmentIds' field.
      * @param value The value of 'assignmentIds'.
      * @return This builder.
      */
    public com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder setAssignmentIds(java.util.List<java.lang.CharSequence> value) {
      validate(fields()[0], value);
      this.assignmentIds = value;
      fieldSetFlags()[0] = true;
      return this;
    }

    /**
      * Checks whether the 'assignmentIds' field has been set.
      * @return True if the 'assignmentIds' field has been set, false otherwise.
      */
    public boolean hasAssignmentIds() {
      return fieldSetFlags()[0];
    }


    /**
      * Clears the value of the 'assignmentIds' field.
      * @return This builder.
      */
    public com.vmaudev.assignment_service.event.AssignmentDeletedEvent.Builder clearAssignmentIds() {
      assignmentIds = null;
      fieldSetFlags()[0] = false;
      return this;
    }

    @Override
    @SuppressWarnings("unchecked")
    public AssignmentDeletedEvent build() {
      try {
        AssignmentDeletedEvent record = new AssignmentDeletedEvent();
        record.assignmentIds = fieldSetFlags()[0] ? this.assignmentIds : (java.util.List<java.lang.CharSequence>) defaultValue(fields()[0]);
        return record;
      } catch (org.apache.avro.AvroMissingFieldException e) {
        throw e;
      } catch (java.lang.Exception e) {
        throw new org.apache.avro.AvroRuntimeException(e);
      }
    }
  }

  @SuppressWarnings("unchecked")
  private static final org.apache.avro.io.DatumWriter<AssignmentDeletedEvent>
    WRITER$ = (org.apache.avro.io.DatumWriter<AssignmentDeletedEvent>)MODEL$.createDatumWriter(SCHEMA$);

  @Override public void writeExternal(java.io.ObjectOutput out)
    throws java.io.IOException {
    WRITER$.write(this, SpecificData.getEncoder(out));
  }

  @SuppressWarnings("unchecked")
  private static final org.apache.avro.io.DatumReader<AssignmentDeletedEvent>
    READER$ = (org.apache.avro.io.DatumReader<AssignmentDeletedEvent>)MODEL$.createDatumReader(SCHEMA$);

  @Override public void readExternal(java.io.ObjectInput in)
    throws java.io.IOException {
    READER$.read(this, SpecificData.getDecoder(in));
  }

  @Override protected boolean hasCustomCoders() { return true; }

  @Override public void customEncode(org.apache.avro.io.Encoder out)
    throws java.io.IOException
  {
    long size0 = this.assignmentIds.size();
    out.writeArrayStart();
    out.setItemCount(size0);
    long actualSize0 = 0;
    for (java.lang.CharSequence e0: this.assignmentIds) {
      actualSize0++;
      out.startItem();
      out.writeString(e0);
    }
    out.writeArrayEnd();
    if (actualSize0 != size0)
      throw new java.util.ConcurrentModificationException("Array-size written was " + size0 + ", but element count was " + actualSize0 + ".");

  }

  @Override public void customDecode(org.apache.avro.io.ResolvingDecoder in)
    throws java.io.IOException
  {
    org.apache.avro.Schema.Field[] fieldOrder = in.readFieldOrderIfDiff();
    if (fieldOrder == null) {
      long size0 = in.readArrayStart();
      java.util.List<java.lang.CharSequence> a0 = this.assignmentIds;
      if (a0 == null) {
        a0 = new SpecificData.Array<java.lang.CharSequence>((int)size0, SCHEMA$.getField("assignmentIds").schema());
        this.assignmentIds = a0;
      } else a0.clear();
      SpecificData.Array<java.lang.CharSequence> ga0 = (a0 instanceof SpecificData.Array ? (SpecificData.Array<java.lang.CharSequence>)a0 : null);
      for ( ; 0 < size0; size0 = in.arrayNext()) {
        for ( ; size0 != 0; size0--) {
          java.lang.CharSequence e0 = (ga0 != null ? ga0.peek() : null);
          e0 = in.readString(e0 instanceof Utf8 ? (Utf8)e0 : null);
          a0.add(e0);
        }
      }

    } else {
      for (int i = 0; i < 1; i++) {
        switch (fieldOrder[i].pos()) {
        case 0:
          long size0 = in.readArrayStart();
          java.util.List<java.lang.CharSequence> a0 = this.assignmentIds;
          if (a0 == null) {
            a0 = new SpecificData.Array<java.lang.CharSequence>((int)size0, SCHEMA$.getField("assignmentIds").schema());
            this.assignmentIds = a0;
          } else a0.clear();
          SpecificData.Array<java.lang.CharSequence> ga0 = (a0 instanceof SpecificData.Array ? (SpecificData.Array<java.lang.CharSequence>)a0 : null);
          for ( ; 0 < size0; size0 = in.arrayNext()) {
            for ( ; size0 != 0; size0--) {
              java.lang.CharSequence e0 = (ga0 != null ? ga0.peek() : null);
              e0 = in.readString(e0 instanceof Utf8 ? (Utf8)e0 : null);
              a0.add(e0);
            }
          }
          break;

        default:
          throw new java.io.IOException("Corrupt ResolvingDecoder.");
        }
      }
    }
  }
}










